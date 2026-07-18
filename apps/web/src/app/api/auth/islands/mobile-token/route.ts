import { NextResponse } from "next/server";

import { getIslandsTokenUrl } from "@/lib/islands-sso";

export const dynamic = "force-dynamic";

interface IslandsTokenResponse {
  access_token?: string;
  expires_at?: number;
  expires_in?: number;
  refresh_token?: string;
  error?: string;
}

function allowedRedirectUri(value: string) {
  if (value === "usermanual://auth/callback") {
    return true;
  }

  if (process.env.NODE_ENV !== "production" && value.startsWith("exp://")) {
    return true;
  }

  return process.env.ISLANDS_MOBILE_REDIRECT_URI === value;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code = String(body.code || "");
  const clientId = String(body.clientId || "");
  const redirectUri = String(body.redirectUri || "");

  if (!code || !clientId || !redirectUri) {
    return NextResponse.json(
      { error: "code, clientId, and redirectUri are required" },
      { status: 400 },
    );
  }

  if (clientId !== (process.env.NEXT_PUBLIC_ISLANDS_MOBILE_CLIENT_ID ?? "tutorial-mobile")) {
    return NextResponse.json({ error: "Unknown mobile client" }, { status: 400 });
  }

  if (!allowedRedirectUri(redirectUri)) {
    return NextResponse.json({ error: "Unsupported redirect URI" }, { status: 400 });
  }

  let tokenResponse: Response;
  try {
    tokenResponse = await fetch(getIslandsTokenUrl(), {
      body: JSON.stringify({
        client_id: clientId,
        client_secret:
          process.env.ISLANDS_MOBILE_CLIENT_SECRET ?? process.env.ISLANDS_SSO_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
  } catch {
    return NextResponse.json({ error: "Islands sign-in is not available yet." }, { status: 503 });
  }

  let tokenPayload: IslandsTokenResponse | null = null;
  try {
    tokenPayload = (await tokenResponse.json()) as IslandsTokenResponse;
  } catch {
    tokenPayload = null;
  }

  if (!tokenResponse.ok || !tokenPayload?.access_token || !tokenPayload.refresh_token) {
    return NextResponse.json(
      { error: tokenPayload?.error ?? "Islands sign-in could not be completed." },
      { status: 401 },
    );
  }

  return NextResponse.json({
    accessToken: tokenPayload.access_token,
    expiresAt:
      tokenPayload.expires_at ??
      (tokenPayload.expires_in
        ? Math.floor(Date.now() / 1000) + tokenPayload.expires_in
        : null),
    refreshToken: tokenPayload.refresh_token,
  });
}
