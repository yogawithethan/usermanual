import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { clearStoredSession } from "@/auth/session";
import type { UserManualManifest, UserManualSyncPayload } from "@/content/types";
import { clearPendingCheckout, readPendingCheckout, type PendingCheckout } from "@/payments/checkout";
import { pollEntitlementStatus, refreshUserManualSync } from "@/state/entitlement";
import { loadUserManualData } from "@/state/userManual";
import { clearSyncCache } from "@/storage/cache";
import { clearOutbox, flushOutbox, outboxLabel, readOutbox, type OutboxItem } from "@/storage/outbox";

export default function AccountScreen() {
  const router = useRouter();
  const [manifest, setManifest] = useState<UserManualManifest | null>(null);
  const [sync, setSync] = useState<UserManualSyncPayload | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [outbox, setOutbox] = useState<OutboxItem[]>([]);
  const [pendingCheckout, setPendingCheckout] = useState<PendingCheckout | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const data = await loadUserManualData();
      const pending = await readOutbox();
      const checkout = await readPendingCheckout();

      if (!mounted) return;

      setManifest(data.manifest);
      setSync(data.sync);
      setAccessToken(data.session?.accessToken ?? null);
      setOutbox(pending);
      setPendingCheckout(data.sync?.access.entitled ? null : checkout);
    }

    load().catch((nextError: unknown) => {
      if (mounted) {
        setError(nextError instanceof Error ? nextError.message : "Could not load account.");
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function refresh() {
    if (!accessToken) {
      setError("Sign in with Islands before refreshing account status.");
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const result = await flushOutbox(accessToken);
      const nextSync = await refreshUserManualSync(accessToken);
      if (nextSync) setSync(nextSync);
      setOutbox(await readOutbox());
      setMessage(`${result.flushed} queued item${result.flushed === 1 ? "" : "s"} synced.`);
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : "Could not refresh account.");
    } finally {
      setBusy(false);
    }
  }

  async function refreshEntitlement() {
    if (!accessToken) {
      setError("Sign in with Islands before refreshing entitlement status.");
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const nextSync = await pollEntitlementStatus(accessToken, { attempts: 4, intervalMs: 1500 });
      if (nextSync) setSync(nextSync);
      setPendingCheckout(nextSync?.access.entitled ? null : await readPendingCheckout());
      setMessage(nextSync?.access.entitled ? "Unlock confirmed." : "Entitlement is not active yet.");
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : "Could not refresh entitlement.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await clearStoredSession();
    await Promise.all([clearSyncCache(), clearOutbox(), clearPendingCheckout()]);
    setSync(null);
    setAccessToken(null);
    setOutbox([]);
    setPendingCheckout(null);
    router.replace("/");
  }

  if (error && !manifest) {
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
        <Text style={styles.eyebrow}>Account</Text>
        <Text style={styles.title}>{sync?.profile?.displayName ?? sync?.profile?.email ?? "Islands"}</Text>
        <Text style={styles.subtitle}>
          {sync
            ? `${sync.access.entitled ? "The User Manual unlocked" : "Free access"} · ${manifest.product.name}`
            : "Sign in from the home screen to sync progress across web and mobile."}
        </Text>
      </View>

      {error ? <Text style={styles.inlineError}>{error}</Text> : null}
      {message ? <Text style={styles.inlineMessage}>{message}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync</Text>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{outbox.length} pending item{outbox.length === 1 ? "" : "s"}</Text>
          <Text style={styles.paragraph}>
            Progress, notes, and questions retry automatically when the app opens signed in.
          </Text>
          <Pressable
            disabled={busy || !accessToken}
            onPress={refresh}
            style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null, busy ? styles.disabled : null]}
          >
            <Text style={styles.primaryButtonText}>{busy ? "Syncing..." : "Retry Sync Now"}</Text>
          </Pressable>
        </View>
        {outbox.slice(0, 8).map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.rowTitle}>{outboxLabel(item)}</Text>
            <Text style={styles.rowMeta}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Entitlement</Text>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{sync?.access.entitled ? "Unlocked" : "Not unlocked"}</Text>
          <Text style={styles.paragraph}>
            The same `the-user-manual` entitlement controls web, iOS, Android, downloads, and practice media.
          </Text>
          <Pressable
            disabled={busy || !accessToken}
            onPress={refreshEntitlement}
            style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null, busy ? styles.disabled : null]}
          >
            <Text style={styles.primaryButtonText}>{busy ? "Refreshing..." : "Refresh Entitlement"}</Text>
          </Pressable>
        </View>
        {pendingCheckout && !sync?.access.entitled ? (
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Checkout pending</Text>
            <Text style={styles.rowMeta}>
              {pendingCheckout.status} return · {new Date(pendingCheckout.returnedAt).toLocaleString()}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Pressable onPress={() => router.push("/diagnostics")} style={styles.utilityButton}>
          <Text style={styles.utilityButtonText}>Open Diagnostics</Text>
        </Pressable>
        <Pressable onPress={signOut} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Sign Out</Text>
        </Pressable>
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
  disabled: {
    opacity: 0.56,
  },
  error: {
    color: "#9F1D2F",
    fontSize: 16,
    textAlign: "center",
  },
  eyebrow: {
    color: "#5F6F82",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  hero: {
    gap: 8,
    padding: 20,
  },
  inlineError: {
    color: "#9F1D2F",
    fontSize: 14,
    marginHorizontal: 20,
  },
  inlineMessage: {
    color: "#1E6848",
    fontSize: 14,
    marginHorizontal: 20,
  },
  panel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE4ED",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  panelTitle: {
    color: "#142131",
    fontSize: 18,
    fontWeight: "900",
  },
  paragraph: {
    color: "#3B4B5F",
    fontSize: 15,
    lineHeight: 22,
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
  row: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE4ED",
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 14,
  },
  rowMeta: {
    color: "#5F6F82",
    fontSize: 13,
  },
  rowTitle: {
    color: "#142131",
    fontSize: 15,
    fontWeight: "900",
  },
  screen: {
    backgroundColor: "#F7F1EA",
    flex: 1,
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "#9F1D2F",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 50,
  },
  secondaryButtonText: {
    color: "#9F1D2F",
    fontSize: 15,
    fontWeight: "900",
  },
  section: {
    gap: 10,
    padding: 20,
  },
  sectionTitle: {
    color: "#142131",
    fontSize: 18,
    fontWeight: "900",
  },
  subtitle: {
    color: "#3B4B5F",
    fontSize: 16,
    lineHeight: 22,
  },
  title: {
    color: "#142131",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 0,
  },
  utilityButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE4ED",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 50,
  },
  utilityButtonText: {
    color: "#142131",
    fontSize: 15,
    fontWeight: "900",
  },
});
