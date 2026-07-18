import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  getIslandsClientId,
  getIslandsTokenUrl,
  islandsReturnCookie,
  islandsStateCookie,
  safeReturnPath,
} from "@/lib/islands-sso";
import { createClient } from "@/lib/supabase/server";
import { WELCOME_COMPLETED_COOKIE } from "@/lib/welcome";

interface IslandsTokenResponse {
  access_token?: string;
  refresh_token?: string;
  error?: string;
}

function loginRedirect(requestUrl: URL, message: string) {
  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set("error", message);
  return NextResponse.redirect(loginUrl);
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(islandsStateCookie)?.value;
  const returnTo = safeReturnPath(
    requestUrl.searchParams.get("return_to") ??
      cookieStore.get(islandsReturnCookie)?.value ??
      "/",
  );

  cookieStore.delete(islandsStateCookie);
  cookieStore.delete(islandsReturnCookie);

  if (!code || !state || !expectedState || state !== expectedState) {
    return loginRedirect(requestUrl, "Could not verify the Islands sign-in request.");
  }

  const redirectUri = new URL("/auth/islands/callback", requestUrl.origin);
  let tokenResponse: Response;
  try {
    tokenResponse = await fetch(getIslandsTokenUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: getIslandsClientId(),
        client_secret: process.env.ISLANDS_SSO_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri.toString(),
      }),
      cache: "no-store",
    });
  } catch {
    return loginRedirect(requestUrl, "Islands sign-in is not available yet.");
  }

  let tokenPayload: IslandsTokenResponse | null = null;
  try {
    tokenPayload = (await tokenResponse.json()) as IslandsTokenResponse;
  } catch {
    tokenPayload = null;
  }

  if (
    !tokenResponse.ok ||
    !tokenPayload?.access_token ||
    !tokenPayload.refresh_token
  ) {
    return loginRedirect(
      requestUrl,
      tokenPayload?.error ?? "Islands sign-in could not be completed.",
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.setSession({
    access_token: tokenPayload.access_token,
    refresh_token: tokenPayload.refresh_token,
  });

  if (error) {
    return loginRedirect(requestUrl, error.message);
  }

  if (cookieStore.get(WELCOME_COMPLETED_COOKIE)?.value === "1") {
    const { data: claimsData } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;
    if (userId) {
      await supabase
        .from("profiles")
        .update({ welcome_completed_at: new Date().toISOString() })
        .eq("id", userId);
    }
  }

  return NextResponse.redirect(new URL(returnTo, requestUrl.origin));
}
