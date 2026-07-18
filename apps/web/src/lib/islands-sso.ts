export const islandsStateCookie = "islands_sso_state";
export const islandsReturnCookie = "islands_sso_return_to";

const defaultIslandsOrigin = "https://islands.bio";
const defaultClientId = "tutorial";

export type IslandsAuthMode = "signin" | "signup";

export function getIslandsAuthOrigin() {
  return process.env.ISLANDS_AUTH_ORIGIN ?? defaultIslandsOrigin;
}

export function getIslandsClientId() {
  return process.env.NEXT_PUBLIC_ISLANDS_CLIENT_ID ?? defaultClientId;
}

export function getIslandsAuthorizeUrl() {
  return new URL(
    process.env.ISLANDS_SSO_AUTHORIZE_PATH ?? "/auth/authorize",
    getIslandsAuthOrigin(),
  );
}

export function getIslandsTokenUrl() {
  return new URL(
    process.env.ISLANDS_SSO_TOKEN_PATH ?? "/api/sso/token",
    getIslandsAuthOrigin(),
  );
}

export function safeReturnPath(value: string | null) {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export function safeAuthMode(value: string | null): IslandsAuthMode {
  return value === "signup" ? "signup" : "signin";
}
