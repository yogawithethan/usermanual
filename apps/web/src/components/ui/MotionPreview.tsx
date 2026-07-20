"use client";

import { useEffect, useState } from "react";

import { Button } from "./System";
import styles from "./MotionPreview.module.css";

const tracks = [
  ["Fast", styles.fast],
  ["Standard", styles.standard],
  ["Slow", styles.slow],
  ["Ambient", styles.ambient],
] as const;

export function MotionPreview() {
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <div className={`${styles.root} ${playing ? "" : styles.paused}`}>
      <div className={styles.header}>
        <span className={styles.hint}>
          {reduced ? "Reduced motion is active; movement is intentionally frozen." : "Live timing preview. Ambient motion is accelerated here for review."}
        </span>
        <Button size="small" variant="secondary" type="button" onClick={() => setPlaying((value) => !value)} disabled={reduced}>
          {playing ? "Pause motion" : "Play motion"}
        </Button>
      </div>
      <div className={styles.tracks} aria-label="Motion timing previews">
        {tracks.map(([label, className]) => <div className={styles.track} key={label}><span className={styles.label}>{label}</span><span className={styles.rail}><span className={`${styles.dot} ${className}`} /></span></div>)}
      </div>
    </div>
  );
}
