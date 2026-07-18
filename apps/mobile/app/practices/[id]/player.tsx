import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { VideoView, useVideoPlayer } from "expo-video";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { fetchUserManualSync, patchPracticeProgress, resolvePracticeMediaUrl } from "@/api/userManual";
import type { PracticeUniverseManifest, UserManualSyncPayload } from "@/content/types";
import { loadUserManualData } from "@/state/userManual";
import { writeSyncCache } from "@/storage/cache";
import { enqueueOutboxItem } from "@/storage/outbox";
import { universeThemes } from "@/theme/universes";

type Practice = PracticeUniverseManifest["practices"][number];

function sourceContentType(url: string) {
  if (url.includes(".m3u8")) return "hls";
  if (url.includes(".mpd")) return "dash";
  return "auto";
}

function canPlayInVideoView(practice: Practice, url: string) {
  if (practice.kind === "pdf" || url.toLowerCase().includes(".pdf")) {
    return false;
  }

  return practice.kind === "video" || practice.kind === "audio" || url.includes(".m3u8") || url.includes(".mp4");
}

export default function PracticePlayerScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const practiceId = String(params.id || "");
  const [practice, setPractice] = useState<Practice | null>(null);
  const [universe, setUniverse] = useState<PracticeUniverseManifest | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sync, setSync] = useState<UserManualSyncPayload | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const player = useVideoPlayer(
    mediaUrl
      ? {
          contentType: sourceContentType(mediaUrl),
          metadata: {
            artist: universe?.name,
            title: practice?.title,
          },
          uri: mediaUrl,
        }
      : null,
    (nextPlayer) => {
      nextPlayer.audioMixingMode = "auto";
      nextPlayer.showNowPlayingNotification = true;
    },
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      const data = await loadUserManualData();
      const nextUniverse = data.manifest.practiceUniverses.find((item) =>
        item.practices.some((candidate) => candidate.id === practiceId),
      );
      const nextPractice = nextUniverse?.practices.find((candidate) => candidate.id === practiceId);

      if (!nextUniverse || !nextPractice) {
        throw new Error("Practice not found.");
      }

      if (!data.session?.accessToken) {
        throw new Error("Sign in with Islands before opening practice media.");
      }

      const payload = await resolvePracticeMediaUrl(data.session.accessToken, nextPractice.id);

      if (!mounted) return;

      setUniverse(nextUniverse);
      setPractice(nextPractice);
      setAccessToken(data.session.accessToken);
      setSync(data.sync);
      setMediaUrl(payload.url);
    }

    load().catch((nextError: unknown) => {
      if (mounted) {
        setError(nextError instanceof Error ? nextError.message : "Could not load practice media.");
      }
    });

    return () => {
      mounted = false;
    };
  }, [practiceId]);

  async function markComplete() {
    if (!accessToken || !practice) return;

    setBusy(true);
    setError(null);

    try {
      await patchPracticeProgress(accessToken, {
        practiceId: practice.id,
        status: "completed",
      });
      const nextSync = await fetchUserManualSync({ accessToken });
      if (nextSync.value) {
        await writeSyncCache(accessToken, nextSync.value, nextSync.etag);
        setSync(nextSync.value);
      }
    } catch (nextError: unknown) {
      await enqueueOutboxItem({
        body: {
          practiceId: practice.id,
          status: "completed",
        },
        type: "practice-progress",
      });
      setError("Practice progress could not sync now. It was saved for retry.");
    } finally {
      setBusy(false);
    }
  }

  async function openExternal() {
    if (mediaUrl) {
      await WebBrowser.openBrowserAsync(mediaUrl);
    }
  }

  if (error && !practice) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!practice || !universe || !mediaUrl) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  const theme = universeThemes[universe.slug] ?? universeThemes.default;
  const progress = sync?.progress.practices.find((item) => item.practice_id === practice.id);
  const playable = canPlayInVideoView(practice, mediaUrl);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={[styles.screen, { backgroundColor: theme.surface }]}>
      <View style={[styles.hero, { borderColor: theme.accent }]}>
        <Text style={[styles.eyebrow, { color: theme.ink }]}>{universe.name}</Text>
        <Text style={[styles.title, { color: theme.ink }]}>{practice.title}</Text>
        <Text style={[styles.subtitle, { color: theme.ink }]}>{practice.kind}</Text>
      </View>

      {error ? <Text style={styles.inlineError}>{error}</Text> : null}

      <View style={styles.playerShell}>
        {playable ? (
          <VideoView
            allowsPictureInPicture
            contentFit="contain"
            nativeControls
            player={player}
            style={styles.video}
          />
        ) : (
          <View style={styles.externalPanel}>
            <Text style={styles.externalTitle}>Open Protected File</Text>
            <Text style={styles.externalCopy}>This practice uses a format that should open outside the native player.</Text>
            <Pressable onPress={openExternal} style={styles.lightButton}>
              <Text style={styles.lightButtonText}>Open File</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Progress</Text>
          <Text style={styles.paragraph}>
            {progress
              ? `${progress.completion_count} completions · ${progress.status.replace("_", " ")}`
              : "No completions logged yet."}
          </Text>
          <Pressable
            disabled={busy}
            onPress={markComplete}
            style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null, busy ? styles.disabled : null]}
          >
            <Text style={styles.primaryButtonText}>{busy ? "Saving..." : "Mark Practice Complete"}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    gap: 8,
    padding: 16,
  },
  blockTitle: {
    color: "#142131",
    fontSize: 18,
    fontWeight: "900",
  },
  centered: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  disabled: {
    opacity: 0.56,
  },
  error: {
    color: "#9F1D2F",
    fontSize: 16,
    textAlign: "center",
  },
  externalCopy: {
    color: "#DCE4ED",
    fontSize: 15,
    lineHeight: 22,
  },
  externalPanel: {
    gap: 10,
    padding: 18,
  },
  externalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  hero: {
    borderBottomWidth: 2,
    gap: 8,
    padding: 20,
  },
  inlineError: {
    color: "#9F1D2F",
    fontSize: 14,
    marginHorizontal: 20,
    marginTop: 12,
  },
  lightButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
  },
  lightButtonText: {
    color: "#142131",
    fontSize: 15,
    fontWeight: "900",
  },
  paragraph: {
    color: "#3B4B5F",
    fontSize: 15,
    lineHeight: 22,
  },
  playerShell: {
    backgroundColor: "#142131",
    borderRadius: 8,
    margin: 20,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.82,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#142131",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  screen: {
    flex: 1,
  },
  section: {
    gap: 10,
    padding: 20,
    paddingTop: 0,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    textTransform: "capitalize",
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
  },
  video: {
    aspectRatio: 16 / 9,
    width: "100%",
  },
});
