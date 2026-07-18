import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { resolveDownloadUrl } from "@/api/userManual";
import { AccessBanner } from "@/components/AccessBanner";
import type { UserManualManifest, UserManualSyncPayload } from "@/content/types";
import { openUserManualCheckout, readPendingCheckout, type PendingCheckout } from "@/payments/checkout";
import { pollEntitlementStatus } from "@/state/entitlement";
import { loadUserManualData } from "@/state/userManual";
import * as WebBrowser from "expo-web-browser";

export default function LibraryScreen() {
  const [manifest, setManifest] = useState<UserManualManifest | null>(null);
  const [sync, setSync] = useState<UserManualSyncPayload | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingCheckout, setPendingCheckout] = useState<PendingCheckout | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    loadUserManualData()
      .then(async (data) => {
        const pending = await readPendingCheckout();
        if (!mounted) return;
        setManifest(data.manifest);
        setSync(data.sync);
        setAccessToken(data.session?.accessToken ?? null);
        setPendingCheckout(data.sync?.access.entitled ? null : pending);
      })
      .catch((nextError: unknown) => {
        if (mounted) {
          setError(nextError instanceof Error ? nextError.message : "Could not load library.");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function unlock() {
    if (!accessToken) {
      setError("Sign in with Islands before unlocking The User Manual.");
      return;
    }

    setBusyId("checkout");
    setError(null);
    setStatusMessage(null);

    try {
      const result = await openUserManualCheckout(accessToken, "mobile-library");
      const refreshed = await pollEntitlementStatus(accessToken);
      setSync(refreshed);
      setPendingCheckout(refreshed?.access.entitled ? null : await readPendingCheckout());
      setStatusMessage(
        refreshed?.access.entitled
          ? "Unlock confirmed."
          : result.status === "cancel"
            ? "Checkout was cancelled."
            : "Checkout returned. Entitlement is still pending; refresh again from Account if it does not appear.",
      );
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : "Could not start checkout.");
    } finally {
      setBusyId(null);
    }
  }

  async function openDownload(downloadId: string) {
    if (!accessToken) {
      setError("Sign in with Islands before opening downloads.");
      return;
    }

    setBusyId(downloadId);
    setError(null);

    try {
      const payload = await resolveDownloadUrl(accessToken, downloadId);
      await WebBrowser.openBrowserAsync(payload.url);
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : "Could not open download.");
    } finally {
      setBusyId(null);
    }
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

  const entitled = Boolean(sync?.access.entitled ?? manifest.access.entitled);
  const practices = manifest.practiceUniverses.flatMap((universe) =>
    universe.practices.map((practice) => ({
      ...practice,
      universeName: universe.name,
    })),
  );

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Library</Text>
        <Text style={styles.title}>{entitled ? "Unlocked" : "$144 Unlock"}</Text>
        <Text style={styles.subtitle}>
          Practice library, FAQs, downloads, and paid User Manual content share the same entitlement across web and mobile.
        </Text>
      </View>

      <View style={styles.accessWrap}>
        <AccessBanner
          actionLabel={!accessToken ? undefined : entitled ? undefined : busyId === "checkout" ? "Opening..." : "Unlock The User Manual"}
          body={
            !accessToken
              ? "Sign in with Islands to start the free tutorial. Paid library access stays attached to the same account."
              : entitled
                ? "Downloads, paid practices, and protected media are available on this account."
                : "One $144 unlock opens the paid User Manual library across web and native apps."
          }
          disabled={busyId === "checkout"}
          onAction={!accessToken || entitled ? undefined : unlock}
          title={!accessToken ? "Sign-in required" : entitled ? "Unlocked" : "Purchase required"}
          tone={!accessToken ? "signed-in" : entitled ? "unlocked" : "paid"}
        />
      </View>

      {error ? <Text style={styles.inlineError}>{error}</Text> : null}
      {statusMessage ? <Text style={styles.inlineMessage}>{statusMessage}</Text> : null}
      {pendingCheckout && !entitled ? (
        <Text style={styles.inlineMessage}>
          Checkout returned {new Date(pendingCheckout.returnedAt).toLocaleTimeString()}. Entitlement confirmation is pending.
        </Text>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Downloads</Text>
        {manifest.downloads.length ? (
          manifest.downloads.map((download) => (
            <Pressable
              disabled={!entitled || busyId === download.id}
              key={download.id}
              onPress={() => openDownload(download.id)}
              style={({ pressed }) => [styles.row, pressed ? styles.pressed : null, !entitled ? styles.disabled : null]}
            >
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{download.title}</Text>
                <Text style={styles.rowMeta}>{download.description ?? "Protected download"}</Text>
              </View>
              <Text style={styles.rowAction}>{entitled ? "Open" : "Paid"}</Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.paragraph}>Downloads will appear here once published.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Practices</Text>
        {practices.slice(0, 12).map((practice) => (
          <View key={practice.id} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{practice.title}</Text>
              <Text style={styles.rowMeta}>
                {practice.universeName} · {practice.durationMinutes ? `${practice.durationMinutes} min` : practice.kind}
              </Text>
            </View>
            <Text style={styles.rowAction}>{practice.isAvailable && entitled ? "Ready" : "Locked"}</Text>
          </View>
        ))}
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
    gap: 10,
    padding: 20,
  },
  accessWrap: {
    paddingHorizontal: 20,
    paddingBottom: 4,
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
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE4ED",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 74,
    padding: 14,
  },
  rowAction: {
    color: "#1E68B6",
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 12,
  },
  rowMeta: {
    color: "#5F6F82",
    fontSize: 14,
    lineHeight: 19,
    marginTop: 2,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    color: "#142131",
    fontSize: 16,
    fontWeight: "900",
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
    fontWeight: "900",
  },
  subtitle: {
    color: "#3B4B5F",
    fontSize: 16,
    lineHeight: 22,
  },
  title: {
    color: "#142131",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 0,
  },
});
