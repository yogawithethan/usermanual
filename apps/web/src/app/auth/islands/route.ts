import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  getIslandsAuthorizeUrl,
  getIslandsClientId,
  islandsReturnCookie,
  islandsStateCookie,
  safeAuthMode,
  safeReturnPath,
} from "@/lib/islands-sso";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const returnTo = safeReturnPath(requestUrl.searchParams.get("next"));
  const mode = safeAuthMode(requestUrl.searchParams.get("mode"));
  const state = crypto.randomUUID();
  const redirectUri = new URL("/auth/islands/callback", requestUrl.origin);
  const authorizeUrl = getIslandsAuthorizeUrl();

  authorizeUrl.searchParams.set("client_id", getIslandsClientId());
  authorizeUrl.searchParams.set("redirect_uri", redirectUri.toString());
  authorizeUrl.searchParams.set("return_to", returnTo);
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("mode", mode);

  const cookieStore = await cookies();
  const secure = requestUrl.protocol === "https:";

  cookieStore.set(islandsStateCookie, state, {
    httpOnly: true,
    maxAge: 60 * 10,
    path: "/",
    sameSite: "lax",
    secure,
  });
  cookieStore.set(islandsReturnCookie, returnTo, {
    httpOnly: true,
    maxAge: 60 * 10,
    path: "/",
    sameSite: "lax",
    secure,
  });

  return NextResponse.redirect(authorizeUrl);
}
