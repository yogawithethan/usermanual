import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  fetchContentManifest,
  fetchUserManualSync,
  getUserManualApiBaseUrl,
} from "@/api/userManual";
import { getIslandsMobileAuthConfig, refreshIslandsSession } from "@/auth/islands";
import { getStoredSession } from "@/auth/session";
import type { StoredSession } from "@/auth/session";
import { readPendingCheckout } from "@/payments/checkout";
import { readManifestCache, readSyncCache } from "@/storage/cache";
import { readOutbox } from "@/storage/outbox";

type CheckState = {
  manifest?: string;
  refresh?: string;
  sync?: string;
};

type DiagnosticsSnapshot = {
  entitlement: string;
  manifestCache: string;
  outboxCount: number;
  pendingCheckout: string;
  profile: string;
  session: StoredSession | null;
  syncCache: string;
};

function formatSavedAt(value?: string) {
  if (!value) return "No timestamp";
  return new Date(value).toLocaleString();
}

function summarizeToken(value?: string | null) {
  if (!value) return "None";
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function summarizeExpiry(value?: number | null) {
  if (!value) return "Unknown";
  const expiresAt = new Date(value * 1000);
  const secondsRemaining = value - Math.floor(Date.now() / 1000);
  return `${expiresAt.toLocaleString()} · ${secondsRemaining}s remaining`;
}

export default function DiagnosticsScreen() {
  const authConfig = getIslandsMobileAuthConfig();
  const [snapshot, setSnapshot] = useState<DiagnosticsSnapshot | null>(null);
  const [checks, setChecks] = useState<CheckState>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSnapshot = useCallback(async () => {
    const session = await getStoredSession();
    const [manifestCache, syncCache, outbox, pendingCheckout] = await Promise.all([
      readManifestCache(),
      session ? readSyncCache(session.accessToken) : Promise.resolve(null),
      readOutbox(),
      readPendingCheckout(),
    ]);

    setSnapshot({
      entitlement: syncCache?.value.access.entitled ? "Unlocked" : "Not unlocked",
      manifestCache: manifestCache
        ? `${manifestCache.value.product.name} · ${formatSavedAt(manifestCache.savedAt)}`
        : "No manifest cache",
      outboxCount: outbox.length,
      pendingCheckout: pendingCheckout
        ? `${pendingCheckout.status} · ${pendingCheckout.sessionId ?? "no session id"} · ${formatSavedAt(pendingCheckout.returnedAt)}`
        : "No pending checkout",
      profile: syncCache?.value.profile?.email ?? syncCache?.value.profile?.displayName ?? "No cached profile",
      session,
      syncCache: syncCache
        ? `${syncCache.value.syncVersion} · ${formatSavedAt(syncCache.savedAt)}`
        : "No sync cache",
    });
  }, []);

  useEffect(() => {
    loadSnapshot().catch((nextError: unknown) => {
      setError(nextError instanceof Error ? nextError.message : "Could not load diagnostics.");
    });
  }, [loadSnapshot]);

  async function checkManifest() {
    setBusy(true);
    setError(null);

    try {
      const cache = await readManifestCache();
      const result = await fetchContentManifest({ etag: cache?.etag ?? undefined });
      setChecks((current) => ({
        ...current,
        manifest: result.notModified
          ? `304 not modified · ETag ${result.etag ?? "unchanged"}`
          : `200 ok · ${result.value?.levels.length ?? 0} levels · ${result.value?.practiceUniverses.length ?? 0} side quests · ETag ${result.etag ?? "none"}`,
      }));
      await loadSnapshot();
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : "Manifest check failed.");
    } finally {
      setBusy(false);
    }
  }

  async function checkSync() {
    if (!snapshot?.session) {
      setError("Sign in with Islands before checking the protected sync endpoint.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const cache = await readSyncCache(snapshot.session.accessToken);
      const result = await fetchUserManualSync({
        accessToken: snapshot.session.accessToken,
        etag: cache?.etag ?? undefined,
      });
      setChecks((current) => ({
        ...current,
        sync: result.notModified
          ? `304 not modified · ETag ${result.etag ?? "unchanged"}`
          : `200 ok · ${result.value?.access.entitled ? "unlocked" : "free"} · ETag ${result.etag ?? "none"}`,
      }));
      await loadSnapshot();
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : "Sync check failed.");
    } finally {
      setBusy(false);
    }
  }

  async function checkRefresh() {
    if (!snapshot?.session) {
      setError("Sign in with Islands before checking session refresh.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const nextSession = await refreshIslandsSession();
      setChecks((current) => ({
        ...current,
        refresh: nextSession ? `200 ok · ${summarizeToken(nextSession.accessToken)}` : "Refresh rejected",
      }));
      await loadSnapshot();
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : "Session refresh failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!snapshot) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Device Readiness</Text>
        <Text style={styles.title}>Diagnostics</Text>
        <Text style={styles.subtitle}>
          Check the native app contract before debugging UI: API config, Islands redirect, cache, entitlement, and queued writes.
        </Text>
      </View>

      {error ? <Text style={styles.inlineError}>{error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuration</Text>
        <DiagnosticRow label="API base URL" value={getUserManualApiBaseUrl()} />
        <DiagnosticRow label="Auth URL" value={authConfig.islandsAuthorizeUrl} />
        <DiagnosticRow label="Client ID" value={authConfig.islandsClientId} />
        <DiagnosticRow label="Redirect URI" value={authConfig.redirectUri} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session</Text>
        <DiagnosticRow label="Stored session" value={snapshot.session ? "Yes" : "No"} />
        <DiagnosticRow label="Access token" value={summarizeToken(snapshot.session?.accessToken)} />
        <DiagnosticRow label="Refresh token" value={summarizeToken(snapshot.session?.refreshToken)} />
        <DiagnosticRow label="Token expiry" value={summarizeExpiry(snapshot.session?.expiresAt)} />
        <DiagnosticRow label="Profile" value={snapshot.profile} />
        <DiagnosticRow label="Entitlement" value={snapshot.entitlement} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Local State</Text>
        <DiagnosticRow label="Manifest cache" value={snapshot.manifestCache} />
        <DiagnosticRow label="Sync cache" value={snapshot.syncCache} />
        <DiagnosticRow label="Outbox" value={`${snapshot.outboxCount} pending item${snapshot.outboxCount === 1 ? "" : "s"}`} />
        <DiagnosticRow label="Checkout" value={snapshot.pendingCheckout} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Endpoint Checks</Text>
        <View style={styles.actions}>
          <Pressable
            disabled={busy}
            onPress={checkManifest}
            style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null, busy ? styles.disabled : null]}
          >
            <Text style={styles.primaryButtonText}>Check Manifest</Text>
          </Pressable>
          <Pressable
            disabled={busy || !snapshot.session}
            onPress={checkSync}
            style={({ pressed }) => [styles.secondaryButton, pressed ? styles.pressed : null, busy ? styles.disabled : null]}
          >
            <Text style={styles.secondaryButtonText}>Check Sync</Text>
          </Pressable>
        </View>
        <Pressable
          disabled={busy || !snapshot.session}
          onPress={checkRefresh}
          style={({ pressed }) => [styles.secondaryButton, pressed ? styles.pressed : null, busy ? styles.disabled : null]}
        >
          <Text style={styles.secondaryButtonText}>Refresh Session</Text>
        </Pressable>
        <DiagnosticRow label="Manifest result" value={checks.manifest ?? "Not checked"} />
        <DiagnosticRow label="Sync result" value={checks.sync ?? "Not checked"} />
        <DiagnosticRow label="Refresh result" value={checks.refresh ?? "Not checked"} />
      </View>
    </ScrollView>
  );
}

function DiagnosticRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  centered: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.52,
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
  pressed: {
    opacity: 0.82,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#142131",
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  row: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE4ED",
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    padding: 14,
  },
  rowLabel: {
    color: "#5F6F82",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  rowValue: {
    color: "#142131",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },
  screen: {
    backgroundColor: "#F7F1EA",
    flex: 1,
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "#142131",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: "#142131",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
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
});
