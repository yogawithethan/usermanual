import { fetchContentManifest, fetchUserManualSync } from "@/api/userManual";
import { getValidIslandsSession } from "@/auth/islands";
import type { StoredSession } from "@/auth/session";
import type { UserManualManifest, UserManualSyncPayload } from "@/content/types";
import {
  readManifestCache,
  readSyncCache,
  writeManifestCache,
  writeSyncCache,
} from "@/storage/cache";
import { flushOutbox, readOutbox } from "@/storage/outbox";

export interface UserManualData {
  manifest: UserManualManifest;
  session: StoredSession | null;
  sync: UserManualSyncPayload | null;
}

export async function loadUserManualData(): Promise<UserManualData> {
  const session = await getValidIslandsSession();
  const accessToken = session?.accessToken;
  if (accessToken) {
    await flushOutbox(accessToken);
  }
  const manifestCache = await readManifestCache();
  const syncCache = session ? await readSyncCache(session.accessToken) : null;
  const [manifestResult, syncResult] = await Promise.all([
    fetchContentManifest({ accessToken, etag: manifestCache?.etag ?? undefined }).catch(() => null),
    accessToken
      ? fetchUserManualSync({ accessToken, etag: syncCache?.etag ?? undefined }).catch(() => null)
      : Promise.resolve(null),
  ]);

  const manifest = manifestResult?.value ?? manifestCache?.value ?? null;
  if (manifestResult?.value) {
    await writeManifestCache(manifestResult.value, manifestResult.etag);
  }

  if (!manifest) {
    throw new Error("The User Manual content is not available yet.");
  }

  let sync = syncResult?.value ?? syncCache?.value ?? null;
  if (syncResult?.value) {
    await writeSyncCache(session!.accessToken, syncResult.value, syncResult.etag);
    sync = syncResult.value;
  }

  return {
    manifest,
    session,
    sync,
  };
}

export async function pendingOutboxCount() {
  return (await readOutbox()).length;
}

export function completedLevelCount(sync: UserManualSyncPayload | null) {
  return sync?.progress.levels.filter((item) => item.status === "completed").length ?? 0;
}

export function practiceCompletionCount(sync: UserManualSyncPayload | null) {
  return sync?.progress.practices.reduce((total, item) => total + item.completion_count, 0) ?? 0;
}

export function levelStatus(sync: UserManualSyncPayload | null, levelNumber: number) {
  return (
    sync?.progress.levels.find((item) => item.level_number === levelNumber)?.status ??
    "not_started"
  );
}
