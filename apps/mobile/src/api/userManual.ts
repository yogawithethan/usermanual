import Constants from "expo-constants";

import { getValidIslandsSession, refreshIslandsSession } from "@/auth/islands";
import type {
  LessonCommentsPayload,
  ProtectedUrlPayload,
  UserManualManifest,
  UserManualSyncPayload,
} from "@/content/types";

const extra = Constants.expoConfig?.extra as
  | {
      apiBaseUrl?: string;
    }
  | undefined;

const apiBaseUrl = extra?.apiBaseUrl ?? "https://tutorial.yogawithethan.com";

interface ApiOptions {
  etag?: string;
  accessToken?: string;
}

function endpoint(path: string) {
  return new URL(path, apiBaseUrl).toString();
}

export function getUserManualApiBaseUrl() {
  return apiBaseUrl;
}

function headers(options: ApiOptions = {}) {
  const nextHeaders: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.etag) nextHeaders["If-None-Match"] = options.etag;
  if (options.accessToken) nextHeaders.Authorization = `Bearer ${options.accessToken}`;

  return nextHeaders;
}

async function fetchApi(path: string, init: RequestInit = {}, options: ApiOptions = {}) {
  const initialHeaders = new Headers(init.headers);
  const validSession = options.accessToken ? await getValidIslandsSession() : null;
  const initialAccessToken = validSession?.accessToken ?? options.accessToken;

  if (initialAccessToken) {
    initialHeaders.set("Authorization", `Bearer ${initialAccessToken}`);
  }

  const response = await fetch(endpoint(path), {
    ...init,
    headers: initialHeaders,
  });
  if (response.status !== 401 || !initialAccessToken) return response;

  const refreshedSession = await refreshIslandsSession();
  if (!refreshedSession) return response;

  const originalHeaders = new Headers(init.headers);
  originalHeaders.set("Authorization", `Bearer ${refreshedSession.accessToken}`);

  return fetch(endpoint(path), {
    ...init,
    headers: originalHeaders,
  });
}

export async function fetchContentManifest(options: ApiOptions = {}) {
  const response = await fetchApi("/api/content/manifest", {
    headers: headers(options),
  }, options);

  if (response.status === 304) {
    return {
      etag: response.headers.get("etag"),
      notModified: true,
      value: null,
    };
  }

  if (!response.ok) {
    throw new Error(`Manifest request failed: ${response.status}`);
  }

  return {
    etag: response.headers.get("etag"),
    notModified: false,
    value: (await response.json()) as UserManualManifest,
  };
}

export async function fetchUserManualSync(options: ApiOptions = {}) {
  const response = await fetchApi("/api/sync/user-manual", {
    headers: headers(options),
  }, options);

  if (response.status === 304) {
    return {
      etag: response.headers.get("etag"),
      notModified: true,
      value: null,
    };
  }

  if (!response.ok) {
    throw new Error(`User sync request failed: ${response.status}`);
  }

  return {
    etag: response.headers.get("etag"),
    notModified: false,
    value: (await response.json()) as UserManualSyncPayload,
  };
}

export async function patchLevelProgress(
  accessToken: string,
  body: { levelNumber: number; status: "not_started" | "in_progress" | "completed" },
) {
  const response = await fetchApi("/api/progress/levels", {
    body: JSON.stringify(body),
    headers: {
      ...headers({ accessToken }),
      "Content-Type": "application/json",
    },
    method: "PATCH",
  }, { accessToken });

  if (!response.ok) {
    throw new Error(`Level progress update failed: ${response.status}`);
  }

  return response.json();
}

export async function patchPracticeProgress(
  accessToken: string,
  body: { practiceId: string; status: "not_started" | "in_progress" | "completed" },
) {
  const response = await fetchApi("/api/progress/practices", {
    body: JSON.stringify(body),
    headers: {
      ...headers({ accessToken }),
      "Content-Type": "application/json",
    },
    method: "PATCH",
  }, { accessToken });

  if (!response.ok) {
    throw new Error(`Practice progress update failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchLessonComments(levelNumber: number, options: ApiOptions = {}) {
  const response = await fetchApi(`/api/lessons/${levelNumber}/comments`, {
    headers: headers(options),
  }, options);

  if (!response.ok) {
    throw new Error(`Comments request failed: ${response.status}`);
  }

  return (await response.json()) as LessonCommentsPayload;
}

export async function createLessonComment(
  accessToken: string,
  levelNumber: number,
  body: { body: string },
) {
  const response = await fetchApi(`/api/lessons/${levelNumber}/comments`, {
    body: JSON.stringify(body),
    headers: {
      ...headers({ accessToken }),
      "Content-Type": "application/json",
    },
    method: "POST",
  }, { accessToken });

  if (!response.ok) {
    throw new Error(`Comment creation failed: ${response.status}`);
  }

  return response.json();
}

export async function createNote(
  accessToken: string,
  body: { body: string; practiceId?: string | null; tutorialLevel?: number | null },
) {
  const response = await fetchApi("/api/notes", {
    body: JSON.stringify(body),
    headers: {
      ...headers({ accessToken }),
      "Content-Type": "application/json",
    },
    method: "POST",
  }, { accessToken });

  if (!response.ok) {
    throw new Error(`Note creation failed: ${response.status}`);
  }

  return response.json();
}

export async function resolvePracticeMediaUrl(accessToken: string, practiceId: string) {
  const response = await fetchApi(`/api/practices/${practiceId}/media?format=json`, {
    headers: headers({ accessToken }),
  }, { accessToken });

  if (!response.ok) {
    throw new Error(`Media access failed: ${response.status}`);
  }

  return (await response.json()) as ProtectedUrlPayload;
}

export async function resolveDownloadUrl(accessToken: string, downloadId: string) {
  const response = await fetchApi(`/api/downloads/${downloadId}?format=json`, {
    headers: headers({ accessToken }),
  }, { accessToken });

  if (!response.ok) {
    throw new Error(`Download access failed: ${response.status}`);
  }

  return (await response.json()) as ProtectedUrlPayload;
}

export async function resolveProgressPhotoUrl(accessToken: string, photoId: string) {
  const response = await fetchApi(`/api/progress/photos/${photoId}?format=json`, {
    headers: headers({ accessToken }),
  }, { accessToken });

  if (!response.ok) {
    throw new Error(`Photo access failed: ${response.status}`);
  }

  return (await response.json()) as ProtectedUrlPayload;
}

export async function uploadProgressPhoto(
  accessToken: string,
  photo: { fileName?: string | null; label?: string | null; mimeType?: string | null; takenAt?: string | null; uri: string },
) {
  const form = new FormData();
  const fileName = photo.fileName || `progress-photo-${Date.now()}.jpg`;

  form.append("file", {
    name: fileName,
    type: photo.mimeType || "image/jpeg",
    uri: photo.uri,
  } as unknown as Blob);

  if (photo.label) form.append("label", photo.label);
  if (photo.takenAt) form.append("takenAt", photo.takenAt);

  const response = await fetchApi("/api/progress/photos", {
    body: form,
    headers: headers({ accessToken }),
    method: "POST",
  }, { accessToken });

  if (!response.ok) {
    throw new Error(`Photo upload failed: ${response.status}`);
  }

  return response.json();
}

export async function deleteProgressPhoto(accessToken: string, photoId: string) {
  const response = await fetchApi(`/api/progress/photos/${photoId}`, {
    headers: headers({ accessToken }),
    method: "DELETE",
  }, { accessToken });

  if (!response.ok) {
    throw new Error(`Photo delete failed: ${response.status}`);
  }

  return response.json();
}

export async function startMobileCheckout(
  accessToken: string,
  body: { cancelReturnTo?: string; feature?: string; successReturnTo?: string } = {},
) {
  const response = await fetchApi("/api/stripe/mobile-checkout", {
    body: JSON.stringify(body),
    headers: {
      ...headers({ accessToken }),
      "Content-Type": "application/json",
    },
    method: "POST",
  }, { accessToken });

  if (!response.ok) {
    throw new Error(`Checkout failed: ${response.status}`);
  }

  return (await response.json()) as { alreadyEntitled: boolean; url: string | null };
}
