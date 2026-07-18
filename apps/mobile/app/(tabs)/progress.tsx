import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  deleteProgressPhoto,
  fetchUserManualSync,
  resolveProgressPhotoUrl,
  uploadProgressPhoto,
} from "@/api/userManual";
import type { UserManualManifest, UserManualSyncPayload } from "@/content/types";
import { completedLevelCount, loadUserManualData, practiceCompletionCount } from "@/state/userManual";
import { writeSyncCache } from "@/storage/cache";

export default function ProgressScreen() {
  const [manifest, setManifest] = useState<UserManualManifest | null>(null);
  const [sync, setSync] = useState<UserManualSyncPayload | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    loadUserManualData()
      .then((data) => {
        if (!mounted) return;
        setManifest(data.manifest);
        setSync(data.sync);
        setAccessToken(data.session?.accessToken ?? null);
      })
      .catch((nextError: unknown) => {
        if (mounted) {
          setError(nextError instanceof Error ? nextError.message : "Could not load progress.");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadPhotoUrls() {
      if (!accessToken || !sync?.userContent.photos.length) {
        setPhotoUrls({});
        return;
      }

      const entries = await Promise.all(
        sync.userContent.photos.slice(0, 6).map(async (photo) => {
          const payload = await resolveProgressPhotoUrl(accessToken, photo.id);
          return [photo.id, payload.url] as const;
        }),
      );

      if (mounted) {
        setPhotoUrls(Object.fromEntries(entries));
      }
    }

    loadPhotoUrls().catch((nextError: unknown) => {
      if (mounted) {
        setError(nextError instanceof Error ? nextError.message : "Could not load progress photos.");
      }
    });

    return () => {
      mounted = false;
    };
  }, [accessToken, sync]);

  async function addPhoto() {
    if (!accessToken) {
      setError("Sign in with Islands before adding progress photos.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError("Photo library permission is required to add progress photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.82,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      await uploadProgressPhoto(accessToken, {
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        uri: asset.uri,
      });

      const nextSync = await fetchUserManualSync({ accessToken });
      if (nextSync.value) {
        await writeSyncCache(accessToken, nextSync.value, nextSync.etag);
        setSync(nextSync.value);
      }
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : "Could not upload progress photo.");
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto(photoId: string) {
    if (!accessToken) return;

    setBusy(true);
    setError(null);

    try {
      await deleteProgressPhoto(accessToken, photoId);
      const nextSync = await fetchUserManualSync({ accessToken });
      if (nextSync.value) {
        await writeSyncCache(accessToken, nextSync.value, nextSync.etag);
        setSync(nextSync.value);
      }
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : "Could not delete progress photo.");
    } finally {
      setBusy(false);
    }
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
        <Text style={styles.eyebrow}>Progress</Text>
        <Text style={styles.title}>{sync ? "Your Manual" : "Sign in to sync"}</Text>
        <Text style={styles.subtitle}>
          {sync
            ? `${completedLevelCount(sync)} of ${manifest.levels.length} levels complete · ${practiceCompletionCount(sync)} practices logged`
            : "Progress, photos, notes, and streaks sync after Islands sign-in."}
        </Text>
        <Pressable
          disabled={busy}
          onPress={addPhoto}
          style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null, busy ? styles.disabled : null]}
        >
          <Text style={styles.primaryButtonText}>{busy ? "Working..." : "Add Progress Photo"}</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.inlineError}>{error}</Text> : null}

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{completedLevelCount(sync)}</Text>
          <Text style={styles.statLabel}>Levels</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{practiceCompletionCount(sync)}</Text>
          <Text style={styles.statLabel}>Practices</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{sync?.userContent.photos.length ?? 0}</Text>
          <Text style={styles.statLabel}>Photos</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photos</Text>
        {sync?.userContent.photos.length ? (
          <View style={styles.photoGrid}>
            {sync.userContent.photos.slice(0, 6).map((photo) => (
              <View key={photo.id} style={styles.photoCard}>
                {photoUrls[photo.id] ? (
                  <Image source={{ uri: photoUrls[photo.id] }} style={styles.photo} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <ActivityIndicator />
                  </View>
                )}
                <View style={styles.photoMeta}>
                  <Text style={styles.photoText}>{photo.label ?? "Progress photo"}</Text>
                  <Pressable disabled={busy} onPress={() => removePhoto(photo.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.paragraph}>No progress photos yet.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Levels</Text>
        {manifest.levels.map((level) => {
          const status =
            sync?.progress.levels.find((item) => item.level_number === level.levelNumber)?.status ??
            "not_started";

          return (
            <View key={level.id} style={styles.row}>
              <View>
                <Text style={styles.rowTitle}>{level.title}</Text>
                <Text style={styles.rowMeta}>{level.subtitle}</Text>
              </View>
              <Text style={styles.rowStatus}>{status.replace("_", " ")}</Text>
            </View>
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
  error: {
    color: "#9F1D2F",
    fontSize: 16,
    textAlign: "center",
  },
  deleteText: {
    color: "#9F1D2F",
    fontSize: 13,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.56,
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
  paragraph: {
    color: "#3B4B5F",
    fontSize: 15,
    lineHeight: 22,
  },
  photo: {
    aspectRatio: 1,
    backgroundColor: "#DCE4ED",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    width: "100%",
  },
  photoCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE4ED",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: "47%",
    overflow: "hidden",
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  photoMeta: {
    gap: 6,
    padding: 10,
  },
  photoPlaceholder: {
    alignItems: "center",
    aspectRatio: 1,
    backgroundColor: "#EEF3F8",
    justifyContent: "center",
    width: "100%",
  },
  photoText: {
    color: "#3B4B5F",
    fontSize: 13,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.82,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#142131",
    borderRadius: 8,
    justifyContent: "center",
    marginTop: 8,
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
    minHeight: 70,
    padding: 14,
  },
  rowMeta: {
    color: "#5F6F82",
    fontSize: 14,
    marginTop: 2,
    textTransform: "capitalize",
  },
  rowStatus: {
    color: "#1E68B6",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  rowTitle: {
    color: "#142131",
    fontSize: 16,
    fontWeight: "900",
    textTransform: "capitalize",
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
  stat: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE4ED",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 82,
    padding: 12,
  },
  statLabel: {
    color: "#5F6F82",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },
  stats: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
  },
  statValue: {
    color: "#142131",
    fontSize: 28,
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
