import AsyncStorage from "@react-native-async-storage/async-storage";

import type { UserManualManifest, UserManualSyncPayload } from "@/content/types";

const manifestKey = "um.cache.manifest";
const currentSyncKey = "um.cache.sync.current";

interface CacheEnvelope<T> {
  etag: string | null;
  savedAt: string;
  value: T;
}

async function readEnvelope<T>(key: string) {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;

  return JSON.parse(raw) as CacheEnvelope<T>;
}

async function writeEnvelope<T>(key: string, value: T, etag: string | null) {
  await AsyncStorage.setItem(
    key,
    JSON.stringify({
      etag,
      savedAt: new Date().toISOString(),
      value,
    } satisfies CacheEnvelope<T>),
  );
}

export async function readManifestCache() {
  return readEnvelope<UserManualManifest>(manifestKey);
}

export async function writeManifestCache(value: UserManualManifest, etag: string | null) {
  await writeEnvelope(manifestKey, value, etag);
}

export async function readSyncCache(_cacheKey?: string) {
  return readEnvelope<UserManualSyncPayload>(currentSyncKey);
}

export async function writeSyncCache(_cacheKey: string | undefined, value: UserManualSyncPayload, etag: string | null) {
  await writeEnvelope(currentSyncKey, value, etag);
}

export async function clearSyncCache() {
  await AsyncStorage.removeItem(currentSyncKey);
}
