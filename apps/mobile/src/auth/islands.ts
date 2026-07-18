import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";

import { getStoredSession, storeSession, type StoredSession } from "@/auth/session";

WebBrowser.maybeCompleteAuthSession();

const extra = Constants.expoConfig?.extra as
  | {
      apiBaseUrl?: string;
      islandsAuthorizeUrl?: string;
      islandsClientId?: string;
    }
  | undefined;

const apiBaseUrl = extra?.apiBaseUrl ?? "https://tutorial.yogawithethan.com";
const islandsAuthorizeUrl = extra?.islandsAuthorizeUrl ?? "https://islands.bio/auth/authorize";
const islandsClientId = extra?.islandsClientId ?? "tutorial-mobile";
const redirectUri = "usermanual://auth/callback";
const expiryRefreshWindowSeconds = 60;

function apiEndpoint(path: string) {
  return new URL(path, apiBaseUrl).toString();
}

function readCallback(url: string) {
  const callbackUrl = new URL(url);

  return {
    code: callbackUrl.searchParams.get("code"),
    error: callbackUrl.searchParams.get("error"),
    state: callbackUrl.searchParams.get("state"),
  };
}

export function getIslandsMobileAuthConfig() {
  return {
    apiBaseUrl,
    islandsAuthorizeUrl,
    islandsClientId,
    redirectUri,
  };
}

export async function signInWithIslands() {
  const state = Crypto.randomUUID();
  const authorizeUrl = new URL(islandsAuthorizeUrl);

  authorizeUrl.searchParams.set("client_id", islandsClientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("return_to", "/");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("mode", "signin");

  const result = await WebBrowser.openAuthSessionAsync(authorizeUrl.toString(), redirectUri);

  if (result.type !== "success") {
    return null;
  }

  const callback = readCallback(result.url);

  if (callback.error) {
    throw new Error(callback.error);
  }

  if (!callback.code || callback.state !== state) {
    throw new Error("Could not verify the Islands sign-in response.");
  }

  const tokenResponse = await fetch(apiEndpoint("/api/auth/islands/mobile-token"), {
    body: JSON.stringify({
      clientId: islandsClientId,
      code: callback.code,
      redirectUri,
    }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!tokenResponse.ok) {
    const payload = await tokenResponse.json().catch(() => ({}));
    throw new Error(payload.error ?? `Islands token exchange failed: ${tokenResponse.status}`);
  }

  const session = (await tokenResponse.json()) as StoredSession;
  await storeSession(session);

  return session;
}

export async function refreshIslandsSession() {
  const currentSession = await getStoredSession();
  if (!currentSession?.refreshToken) return null;

  const tokenResponse = await fetch(apiEndpoint("/api/auth/islands/mobile-refresh"), {
    body: JSON.stringify({
      refreshToken: currentSession.refreshToken,
    }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!tokenResponse.ok) {
    return null;
  }

  const session = (await tokenResponse.json()) as StoredSession;
  await storeSession(session);

  return session;
}

export async function getValidIslandsSession() {
  const currentSession = await getStoredSession();
  if (!currentSession) return null;

  if (!currentSession.expiresAt) {
    return currentSession;
  }

  const expiresInSeconds = currentSession.expiresAt - Math.floor(Date.now() / 1000);
  if (expiresInSeconds > expiryRefreshWindowSeconds) {
    return currentSession;
  }

  return (await refreshIslandsSession()) ?? currentSession;
}
