export const DEV_PROGRESS_COOKIE = "um_dev_progress";
export const DEV_AUTH_COOKIE = "um_dev_auth";
export const DEV_PREMIUM_COOKIE = "um_dev_premium";

export type DevProgressMode = "real" | "half" | "all";

export function normalizeDevProgressMode(value?: string): DevProgressMode {
  if (value === "half" || value === "all") {
    return value;
  }

  return "real";
}

export function devCompletedLevelCount(mode: DevProgressMode, realCount: number): number {
  if (mode === "all") {
    return 6;
  }

  if (mode === "half") {
    return 3;
  }

  return realCount;
}
