import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { fetchContentManifest, fetchUserManualSync } from "@/api/userManual";
import { signInWithIslands } from "@/auth/islands";
import { clearStoredSession, type StoredSession } from "@/auth/session";
import { UniverseMark } from "@/components/UniverseMark";
import type { UserManualManifest, UserManualSyncPayload } from "@/content/types";
import { completedLevelCount, loadUserManualData, pendingOutboxCount, practiceCompletionCount } from "@/state/userManual";
import { clearSyncCache, writeManifestCache, writeSyncCache } from "@/storage/cache";
import { clearOutbox } from "@/storage/outbox";
import { universeThemes } from "@/theme/universes";

export default function HomeScreen() {
  const router = useRouter();
  const [manifest, setManifest] = useState<UserManualManifest | null>(null);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [sync, setSync] = useState<UserManualSyncPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const data = await loadUserManualData();

      if (!mounted) return;

      setSession(data.session);
      setManifest(data.manifest);
      setSync(data.sync);
      setPendingCount(await pendingOutboxCount());
    }

    load()
      .catch((nextError: unknown) => {
        if (mounted) {
          setError(nextError instanceof Error ? nextError.message : "Could not load The User Manual.");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSignIn() {
    setAuthBusy(true);
    setError(null);

    try {
      const nextSession = await signInWithIslands();

      if (!nextSession) return;

      const [nextManifest, nextSync] = await Promise.all([
        fetchContentManifest({ accessToken: nextSession.accessToken }),
        fetchUserManualSync({ accessToken: nextSession.accessToken }),
      ]);

      setSession(nextSession);
      if (nextManifest.value) {
        await writeManifestCache(nextManifest.value, nextManifest.etag);
        setManifest(nextManifest.value);
      }
      if (nextSync.value) {
        await writeSyncCache(nextSession.accessToken, nextSync.value, nextSync.etag);
        setSync(nextSync.value);
      }
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : "Could not sign in with Islands.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    await clearStoredSession();
    await Promise.all([clearSyncCache(), clearOutbox()]);
    setSession(null);
    setSync(null);
    setPendingCount(0);

    fetchContentManifest()
      .then((nextManifest) => {
        if (nextManifest.value) setManifest(nextManifest.value);
      })
      .catch((nextError: unknown) => {
        setError(nextError instanceof Error ? nextError.message : "Could not refresh The User Manual.");
      });
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!manifest) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>One With The Sun</Text>
        <Text style={styles.title}>{manifest.product.name}</Text>
        <Text style={styles.subtitle}>
          {session ? "Progress sync is ready." : "Sign in with Islands to begin the free tutorial."}
        </Text>
        <Pressable
          disabled={authBusy}
          onPress={session ? handleSignOut : handleSignIn}
          style={({ pressed }) => [
            styles.authButton,
            pressed ? styles.authButtonPressed : null,
            authBusy ? styles.authButtonDisabled : null,
          ]}
        >
          <Text style={styles.authButtonText}>
            {authBusy ? "Connecting..." : session ? "Sign Out" : "Sign In With Islands"}
          </Text>
        </Pressable>
      </View>

      {sync ? (
        <View style={styles.syncPanel}>
          <Text style={styles.syncTitle}>{sync.profile?.displayName ?? sync.profile?.email ?? "Signed in"}</Text>
          <Text style={styles.syncMeta}>
            {sync.access.entitled ? "Unlocked" : "Free access"} ·{" "}
            {completedLevelCount(sync)} levels complete · {practiceCompletionCount(sync)} practices logged
            {pendingCount ? ` · ${pendingCount} pending` : ""}
          </Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Main Levels</Text>
        {manifest.levels.map((level) => (
          <Pressable
            key={level.id}
            onPress={() => router.push(`/levels/${level.levelNumber}`)}
            style={({ pressed }) => [styles.levelRow, pressed ? styles.rowPressed : null]}
          >
            <View>
              <Text style={styles.levelTitle}>{level.title}</Text>
              <Text style={styles.levelSubtitle}>{level.subtitle}</Text>
            </View>
            <Text style={styles.levelNumber}>{level.levelNumber}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Side Quests</Text>
        {manifest.practiceUniverses.map((universe) => {
          const theme = universeThemes[universe.slug] ?? universeThemes.default;

          return (
            <Pressable
              key={universe.slug}
              onPress={() => router.push(`/universes/${universe.slug}`)}
              style={[
                styles.universeRow,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.accentSoft,
                },
              ]}
            >
              <View style={[styles.universeRail, { backgroundColor: theme.accent }]} />
              <UniverseMark
                backgroundColor={theme.badgeBackground}
                color={theme.badgeInk}
                mark={theme.mark}
                size={42}
              />
              <View style={styles.universeText}>
                <Text style={[styles.universeTitle, { color: theme.ink, fontFamily: theme.headingFont }]}>
                  {universe.name}
                </Text>
                <Text style={[styles.universeSubtitle, { color: theme.ink, fontFamily: theme.bodyFont }]}>
                  {theme.mood}
                </Text>
              </View>
              <Text style={[styles.lockState, { color: theme.ink, fontFamily: theme.bodyFont }]}>
                {universe.isAvailable ? "Open" : `Level ${universe.unlockLevel}`}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  authButton: {
    alignItems: "center",
    backgroundColor: "#142131",
    borderRadius: 8,
    justifyContent: "center",
    marginTop: 10,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  authButtonDisabled: {
    opacity: 0.56,
  },
  authButtonPressed: {
    opacity: 0.84,
  },
  authButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  error: {
    color: "#9F1D2F",
    fontSize: 16,
    textAlign: "center",
  },
  eyebrow: {
    color: "#5F6F82",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  hero: {
    gap: 8,
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  levelNumber: {
    color: "#1E68B6",
    fontSize: 28,
    fontWeight: "800",
  },
  levelRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE4ED",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 76,
    padding: 16,
  },
  levelSubtitle: {
    color: "#5F6F82",
    fontSize: 15,
    marginTop: 2,
  },
  levelTitle: {
    color: "#142131",
    fontSize: 18,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  lockState: {
    fontSize: 13,
    fontWeight: "800",
  },
  rowPressed: {
    opacity: 0.78,
  },
  screen: {
    backgroundColor: "#F7F1EA",
    flex: 1,
  },
  section: {
    gap: 10,
    padding: 20,
  },
  sectionTitle: {
    color: "#142131",
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    color: "#3B4B5F",
    fontSize: 16,
    lineHeight: 22,
  },
  syncMeta: {
    color: "#3B4B5F",
    fontSize: 14,
    lineHeight: 20,
  },
  syncPanel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE4ED",
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    marginHorizontal: 20,
    marginTop: 4,
    padding: 16,
  },
  syncTitle: {
    color: "#142131",
    fontSize: 17,
    fontWeight: "900",
  },
  title: {
    color: "#142131",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 0,
  },
  universeRow: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 78,
    overflow: "hidden",
    padding: 16,
  },
  universeRail: {
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: 6,
  },
  universeSubtitle: {
    fontSize: 14,
    marginTop: 2,
    opacity: 0.76,
  },
  universeText: {
    flex: 1,
    paddingRight: 8,
  },
  universeTitle: {
    fontSize: 18,
    fontWeight: "900",
    textTransform: "capitalize",
  },
});
