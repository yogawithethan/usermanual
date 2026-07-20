import "server-only";

import { cookies } from "next/headers";

import { DEV_AUTH_COOKIE, DEV_PREMIUM_COOKIE } from "@/lib/dev-progress";

export async function getDevAccessPreview() {
  const enabled = process.env.NODE_ENV !== "production" || process.env.USER_MANUAL_ENABLE_DEV_PREVIEW === "1";
  if (!enabled) return { enabled, entitled: false, fullAccess: false, signedIn: false };

  const cookieStore = await cookies();
  const entitled = cookieStore.get(DEV_PREMIUM_COOKIE)?.value === "1";
  const signedIn = cookieStore.get(DEV_AUTH_COOKIE)?.value === "1";
  return { enabled, entitled, fullAccess: entitled && signedIn, signedIn };
}
