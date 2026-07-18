import { fetchUserManualSync } from "@/api/userManual";
import type { UserManualSyncPayload } from "@/content/types";
import { clearPendingCheckout } from "@/payments/checkout";
import { writeSyncCache } from "@/storage/cache";

interface PollEntitlementOptions {
  attempts?: number;
  intervalMs?: number;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function refreshUserManualSync(accessToken: string) {
  const nextSync = await fetchUserManualSync({ accessToken });
  if (nextSync.value) {
    await writeSyncCache(accessToken, nextSync.value, nextSync.etag);
    if (nextSync.value.access.entitled) {
      await clearPendingCheckout();
    }
    return nextSync.value;
  }

  return null;
}

export async function pollEntitlementStatus(
  accessToken: string,
  options: PollEntitlementOptions = {},
): Promise<UserManualSyncPayload | null> {
  const attempts = options.attempts ?? 5;
  const intervalMs = options.intervalMs ?? 1800;
  let latest: UserManualSyncPayload | null = null;

  for (let index = 0; index < attempts; index += 1) {
    latest = await refreshUserManualSync(accessToken);
    if (latest?.access.entitled) return latest;
    if (index < attempts - 1) await delay(intervalMs);
  }

  return latest;
}
