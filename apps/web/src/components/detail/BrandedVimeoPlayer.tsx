"use client";

import Player from "@vimeo/player";
import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./BrandedVimeoPlayer.module.css";

const PLAYBACK_RATES = [1, 1.25, 1.5, 2] as const;

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const seconds = Math.max(0, Math.floor(value));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

function embedUrl(source: string) {
  let id = source;
  let privacyHash: string | null = null;

  if (!/^\d+$/.test(source)) {
    const url = new URL(source);
    const parts = url.pathname.split("/").filter(Boolean);
    const videoIndex = parts[0] === "video" ? 1 : 0;
    id = parts[videoIndex] ?? "";
    privacyHash = url.searchParams.get("h") ?? parts[videoIndex + 1] ?? null;
  }

  const url = new URL(`https://player.vimeo.com/video/${encodeURIComponent(id)}`);
  url.searchParams.set("autopause", "1");
  url.searchParams.set("byline", "0");
  url.searchParams.set("controls", "0");
  url.searchParams.set("dnt", "1");
  url.searchParams.set("portrait", "0");
  url.searchParams.set("title", "0");
  if (privacyHash) url.searchParams.set("h", privacyHash);
  return url.toString();
}

export function BrandedVimeoPlayer({ source, title = "Core tutorial video" }: { source: string; title?: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousVolumeRef = useRef(1);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [captionsAvailable, setCaptionsAvailable] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (playing) {
      hideTimerRef.current = setTimeout(() => setControlsVisible(false), 2200);
    }
  }, [playing]);

  useEffect(() => {
    if (!iframeRef.current) return;

    const player = new Player(iframeRef.current);
    let active = true;
    playerRef.current = player;

    const markReady = async () => {
      if (!active) return;
      setReady(true);
      setError(null);
      const [videoDuration, videoVolume, rate, tracks] = await Promise.all([
        player.getDuration(),
        player.getVolume(),
        player.getPlaybackRate(),
        player.getTextTracks(),
      ]).catch(() => [0, 1, 1, []] as const);
      if (!active) return;
      setDuration(videoDuration as number);
      setVolume(videoVolume as number);
      setPlaybackRate(rate as number);
      setCaptionsAvailable((tracks as Awaited<ReturnType<Player["getTextTracks"]>>).length > 0);
    };

    void player.ready().then(markReady).catch(() => {
      if (active) setError("This video could not be loaded. Check its Vimeo privacy and embed settings.");
    });
    player.on("play", () => { setPlaying(true); setBuffering(false); });
    player.on("pause", () => setPlaying(false));
    player.on("ended", () => { setPlaying(false); setControlsVisible(true); });
    player.on("bufferstart", () => setBuffering(true));
    player.on("bufferend", () => setBuffering(false));
    player.on("timeupdate", (data) => {
      setCurrentTime(data.seconds);
      setDuration(data.duration);
    });
    player.on("progress", (data) => setBuffered(data.percent));
    player.on("volumechange", (data) => setVolume(data.muted ? 0 : data.volume));
    player.on("playbackratechange", (data) => setPlaybackRate(data.playbackRate));
    player.on("error", () => setError("This video could not be loaded. Check its Vimeo privacy and embed settings."));

    return () => {
      active = false;
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      (["play", "pause", "ended", "bufferstart", "bufferend", "timeupdate", "progress", "volumechange", "playbackratechange", "error"] as const)
        .forEach((event) => player.off(event));
      playerRef.current = null;
      const iframe = iframeRef.current;
      setTimeout(() => {
        if (!iframe?.isConnected) void player.destroy();
      }, 0);
    };
  }, [source]);

  useEffect(() => {
    revealControls();
  }, [playing, revealControls]);

  async function togglePlayback() {
    const player = playerRef.current;
    if (!player) return;
    try {
      if (playing) await player.pause();
      else await player.play();
    } catch {
      setError("Playback was blocked. Select play again to continue.");
    }
  }

  async function seek(value: number) {
    setCurrentTime(value);
    await playerRef.current?.setCurrentTime(value).catch(() => undefined);
  }

  async function changeVolume(value: number) {
    if (value > 0) previousVolumeRef.current = value;
    setVolume(value);
    await playerRef.current?.setVolume(value).catch(() => undefined);
  }

  async function toggleMute() {
    await changeVolume(volume > 0 ? 0 : previousVolumeRef.current || 1);
  }

  async function cyclePlaybackRate() {
    const currentIndex = PLAYBACK_RATES.findIndex((rate) => rate === playbackRate);
    const nextRate = PLAYBACK_RATES[(currentIndex + 1) % PLAYBACK_RATES.length];
    await playerRef.current?.setPlaybackRate(nextRate).catch(() => undefined);
  }

  async function toggleCaptions() {
    const player = playerRef.current;
    if (!player) return;
    try {
      if (captionsOn) {
        await player.disableTextTrack();
        setCaptionsOn(false);
        return;
      }
      const [track] = await player.getTextTracks();
      if (track) {
        await player.enableTextTrack(track.language, track.kind);
        setCaptionsOn(true);
      }
    } catch {
      setCaptionsAvailable(false);
    }
  }

  async function enterPictureInPicture() {
    await playerRef.current?.requestPictureInPicture().catch(() => undefined);
  }

  async function enterFullscreen() {
    if (shellRef.current?.requestFullscreen) {
      await shellRef.current.requestFullscreen().catch(() => undefined);
      return;
    }
    await playerRef.current?.requestFullscreen().catch(() => undefined);
  }

  return (
    <div
      ref={shellRef}
      className={`${styles.player} ${controlsVisible || !playing ? styles.controlsVisible : ""}`}
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
      onTouchStart={revealControls}
      aria-label={title}
    >
      <div className={styles.vimeo}>
        <iframe
          ref={iframeRef}
          src={embedUrl(source)}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>

      {!ready && !error ? <span className={styles.loader} aria-label="Loading video" /> : null}
      {buffering && ready ? <span className={styles.loader} aria-label="Buffering video" /> : null}

      {error ? (
        <div className={styles.error} role="alert">
          <p>{error}</p>
        </div>
      ) : null}

      {!error ? (
        <button className={styles.centerPlay} type="button" onClick={togglePlayback} aria-label={playing ? "Pause video" : "Play video"}>
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
      ) : null}

      <div className={styles.brand} aria-hidden>
        <span className={styles.brandMark}>UM</span>
        <span>The User Manual</span>
      </div>

      <div className={styles.controls}>
        <div className={styles.timelineWrap}>
          <span className={styles.buffered} style={{ width: `${buffered * 100}%` }} />
          <span className={styles.elapsed} style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
          <input
            className={styles.timeline}
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={(event) => void seek(Number(event.target.value))}
            aria-label="Video position"
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
          />
        </div>

        <div className={styles.controlRow}>
          <button type="button" onClick={togglePlayback} aria-label={playing ? "Pause video" : "Play video"}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button type="button" onClick={toggleMute} aria-label={volume > 0 ? "Mute video" : "Unmute video"}>
            {volume > 0 ? <VolumeIcon /> : <MutedIcon />}
          </button>
          <input className={styles.volume} type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => void changeVolume(Number(event.target.value))} aria-label="Volume" />
          <span className={styles.time}>{formatTime(currentTime)} <i>/</i> {formatTime(duration)}</span>
          <span className={styles.spacer} />
          <button className={styles.textButton} type="button" onClick={cyclePlaybackRate} aria-label={`Playback speed ${playbackRate} times`}>{playbackRate}×</button>
          {captionsAvailable ? <button className={captionsOn ? styles.active : ""} type="button" onClick={toggleCaptions} aria-label={captionsOn ? "Turn captions off" : "Turn captions on"}><CaptionsIcon /></button> : null}
          <button type="button" onClick={enterPictureInPicture} aria-label="Picture in picture"><PictureInPictureIcon /></button>
          <button type="button" onClick={enterFullscreen} aria-label="Enter fullscreen"><FullscreenIcon /></button>
        </div>
      </div>
    </div>
  );
}

function PlayIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5.5v13l11-6.5L8 5.5Z" /></svg>;
}

function PauseIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 5h4v14H7zM14 5h4v14h-4z" /></svg>;
}

function VolumeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 9v6h4l5 4V5L9 9H5Z" /><path d="M17 9a4 4 0 0 1 0 6" /><path d="M19.5 6.5a8 8 0 0 1 0 11" /></svg>;
}

function MutedIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 9v6h4l5 4V5L9 9H5Z" /><path d="m18 10 4 4m0-4-4 4" /></svg>;
}

function CaptionsIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 10a2.5 2.5 0 1 0 0 4M18 10a2.5 2.5 0 1 0 0 4" /></svg>;
}

function PictureInPictureIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" /><rect x="12" y="11" width="7" height="5" rx="1" fill="currentColor" stroke="none" /></svg>;
}

function FullscreenIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M8 4H4v4M16 4h4v4M20 16v4h-4M8 20H4v-4" /></svg>;
}
