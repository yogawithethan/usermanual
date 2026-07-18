import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  fetchUserManualSync,
  patchPracticeProgress,
} from "@/api/userManual";
import { AccessBanner } from "@/components/AccessBanner";
import type { PracticeUniverseManifest, UserManualSyncPayload } from "@/content/types";
import { openUserManualCheckout } from "@/payments/checkout";
import { loadUserManualData } from "@/state/userManual";
import { writeSyncCache } from "@/storage/cache";
import { enqueueOutboxItem } from "@/storage/outbox";
import { universeThemes } from "@/theme/universes";

type Practice = PracticeUniverseManifest["practices"][number];

export default function PracticeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const practiceId = String(params.id || "");
  const [practice, setPractice] = useState<Practice | null>(null);
  const [universe, setUniverse] = useState<PracticeUniverseManifest | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sync, setSync] = useState<UserManualSyncPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    loadUserManualData()
      .then((data) => {
        const nextUniverse = data.manifest.practiceUniverses.find((item) =>
          item.practices.some((candidate) => candidate.id === practiceId),
        );
        const nextPractice = nextUniverse?.practices.find((candidate) => candidate.id === practiceId);

        if (!nextUniverse || !nextPractice) {
          throw new Error("Practice not found.");
        }

        if (!mounted) return;

        setUniverse(nextUniverse);
        setPractice(nextPractice);
        setAccessToken(data.session?.accessToken ?? null);
        setSync(data.sync);
      })
      .catch((nextError: unknown) => {
        if (mounted) {
          setError(nextError instanceof Error ? nextError.message : "Could not load this practice.");
        }
      });

    return () => {
      mounted = false;
    };
  }, [practiceId]);

  async function markComplete() {
    if (!accessToken || !practice) {
      setError("Sign in with Islands before logging practice progress.");
      return;
    }

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

  async function openMedia() {
    if (!accessToken || !practice) {
      setError("Sign in with Islands before opening practice media.");
      return;
    }

    router.push(`/practices/${practice.id}/player`);
  }

  async function unlock() {
    if (!accessToken) {
      setError("Sign in with Islands before unlocking The User Manual.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const result = await openUserManualCheckout(accessToken, "practice-library");
      const nextSync = await fetchUserManualSync({ accessToken });
      if (nextSync.value) {
        await writeSyncCache(accessToken, nextSync.value, nextSync.etag);
        setSync(nextSync.value);
      }
      if (result.status === "cancel") {
        setError("Checkout was cancelled.");
      }
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : "Could not start checkout.");
    } finally {
      setBusy(false);
    }
  }

  if (error && !practice) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!practice || !universe) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  const theme = universeThemes[universe.slug] ?? universeThemes.default;
  const progress = sync?.progress.practices.find((item) => item.practice_id === practice.id);
  const entitled = Boolean(sync?.access.entitled);
  const signedIn = Boolean(accessToken);
  const canOpenMedia = signedIn && entitled && practice.isAvailable;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={[styles.screen, { backgroundColor: theme.surface }]}>
      <View style={[styles.hero, { borderColor: theme.accent }]}>
        <Text style={[styles.eyebrow, { color: theme.ink }]}>{universe.name}</Text>
        <Text style={[styles.title, { color: theme.ink }]}>{practice.title}</Text>
        <Text style={[styles.subtitle, { color: theme.ink }]}>
          {practice.durationMinutes ? `${practice.durationMinutes} min · ` : ""}
          {practice.kind}
        </Text>
      </View>

      {error ? <Text style={styles.inlineError}>{error}</Text> : null}

      <View style={styles.accessWrap}>
        <AccessBanner
          actionLabel={
            canOpenMedia
              ? "Open Media"
              : signedIn && practice.isAvailable && !entitled
                ? busy
                  ? "Opening..."
                  : "Unlock The User Manual"
                : undefined
          }
          body={
            !signedIn
              ? "Sign in with Islands before opening practice media or logging progress."
              : !practice.isAvailable
                ? `Complete Level ${practice.unlockLevel} before using this practice.`
                : entitled
                  ? "Protected media and progress logging are available on this account."
                  : "This practice is part of the paid User Manual library."
          }
          disabled={busy}
          onAction={
            canOpenMedia
              ? openMedia
              : signedIn && practice.isAvailable && !entitled
                ? unlock
                : undefined
          }
          title={
            !signedIn
              ? "Sign-in required"
              : !practice.isAvailable
                ? "Practice locked"
                : entitled
                  ? "Ready to practice"
                  : "Purchase required"
          }
          tone={!signedIn ? "signed-in" : !practice.isAvailable ? "locked" : entitled ? "unlocked" : "paid"}
        />
      </View>

      <View style={styles.player}>
        <Text style={styles.playerTitle}>Practice Player</Text>
        <Text style={styles.playerCopy}>
          {practice.isAvailable
            ? "Open the protected media through the shared entitlement endpoint."
            : `Complete Level ${practice.unlockLevel} to unlock this practice.`}
        </Text>
        <Pressable
          disabled={busy || (!canOpenMedia && (!signedIn || !practice.isAvailable))}
          onPress={canOpenMedia ? openMedia : signedIn && practice.isAvailable ? unlock : undefined}
          style={({ pressed }) => [styles.playerButton, pressed ? styles.pressed : null, busy ? styles.disabled : null]}
        >
          <Text style={styles.playerButtonText}>
            {canOpenMedia ? "Open Media" : signedIn ? "Unlock The User Manual" : "Sign In Required"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Overview</Text>
          <Text style={styles.paragraph}>{practice.description ?? "Practice details are coming soon."}</Text>
          {practice.safetyNotes ? <Text style={styles.safety}>{practice.safetyNotes}</Text> : null}
        </View>

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
  accessWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  paragraph: {
    color: "#3B4B5F",
    fontSize: 15,
    lineHeight: 22,
  },
  player: {
    backgroundColor: "#142131",
    borderRadius: 8,
    gap: 8,
    margin: 20,
    minHeight: 180,
    padding: 18,
  },
  playerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  playerCopy: {
    color: "#DCE4ED",
    fontSize: 15,
    lineHeight: 22,
  },
  playerButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    justifyContent: "center",
    marginTop: 8,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  playerButtonText: {
    color: "#142131",
    fontSize: 15,
    fontWeight: "900",
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
  safety: {
    color: "#9F1D2F",
    fontSize: 14,
    lineHeight: 20,
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
});
