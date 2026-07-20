"use server";

import { redirect } from "next/navigation";

import { getIslandsAuthOrigin } from "@/lib/islands-sso";

/**
 * The User Manual never owns credentials. Signing out ends the shared Islands
 * session and returns the member to this web app.
 */
export async function signOut() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const logoutUrl = new URL("/auth/logout", getIslandsAuthOrigin());
  logoutUrl.searchParams.set("return_to", siteUrl);
  redirect(logoutUrl.toString());
}
