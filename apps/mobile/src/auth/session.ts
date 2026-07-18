import * as SecureStore from "expo-secure-store";

const accessTokenKey = "islands.accessToken";
const expiresAtKey = "islands.expiresAt";
const refreshTokenKey = "islands.refreshToken";

export interface StoredSession {
  accessToken: string;
  expiresAt?: number | null;
  refreshToken: string;
}

export async function getStoredSession(): Promise<StoredSession | null> {
  const [accessToken, expiresAt, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(accessTokenKey),
    SecureStore.getItemAsync(expiresAtKey),
    SecureStore.getItemAsync(refreshTokenKey),
  ]);

  if (!accessToken || !refreshToken) return null;

  return {
    accessToken,
    expiresAt: expiresAt ? Number(expiresAt) : null,
    refreshToken,
  };
}

export async function storeSession(session: StoredSession) {
  await Promise.all([
    SecureStore.setItemAsync(accessTokenKey, session.accessToken),
    session.expiresAt
      ? SecureStore.setItemAsync(expiresAtKey, String(session.expiresAt))
      : SecureStore.deleteItemAsync(expiresAtKey),
    SecureStore.setItemAsync(refreshTokenKey, session.refreshToken),
  ]);
}

export async function clearStoredSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(accessTokenKey),
    SecureStore.deleteItemAsync(expiresAtKey),
    SecureStore.deleteItemAsync(refreshTokenKey),
  ]);
}
