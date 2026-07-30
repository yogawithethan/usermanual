import { headers } from "next/headers";
import { getYweWorkerOrigin } from "@/lib/ywe-origin";

export { getYweWorkerOrigin } from "@/lib/ywe-origin";

export async function callYweMemberApi(
  path: string,
  init: RequestInit = {},
) {
  if (!path.startsWith("/api/")) {
    throw new Error("YWE member API paths must begin with /api/.");
  }

  const incoming = await headers();
  const requestHeaders = new Headers(init.headers);
  const cookie = incoming.get("cookie");
  if (cookie) requestHeaders.set("cookie", cookie);
  requestHeaders.set("accept", "application/json");
  if (init.body && !requestHeaders.has("content-type")) {
    requestHeaders.set("content-type", "application/json");
  }

  return fetch(`${getYweWorkerOrigin()}${path}`, {
    ...init,
    cache: "no-store",
    headers: requestHeaders,
  });
}

export async function proxyYweMemberApi(request: Request, path: string) {
  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.text();
  const response = await callYweMemberApi(path, {
    body,
    headers: {
      "content-type": request.headers.get("content-type") ?? "application/json",
      ...(request.headers.get("idempotency-key")
        ? { "idempotency-key": request.headers.get("idempotency-key")! }
        : {}),
    },
    method: request.method,
  });
  const responseBody = request.method === "HEAD"
    ? null
    : response.status === 401
      ? JSON.stringify({ error: "Authentication required" })
      : await response.text();

  return new Response(responseBody, {
    status: response.status,
    headers: {
      "Cache-Control": response.headers.get("cache-control") ?? "private, no-store",
      "Content-Type": response.headers.get("content-type") ?? "application/json",
      ...(response.headers.get("etag") ? { ETag: response.headers.get("etag")! } : {}),
      ...(response.headers.get("x-sync-version")
        ? { "X-Sync-Version": response.headers.get("x-sync-version")! }
        : {}),
    },
  });
}

export interface YweMemberSession {
  signedIn: boolean;
  member?: { displayName: string | null; email: string };
  capabilities?: { email: boolean; purchaseEnabled?: boolean; telegramLinked: boolean };
  access?: {
    entitled: boolean;
    completedLevels: number[];
    levelProgress: Array<{ level_number: number; status: string }>;
  };
  profile?: {
    welcomeCompletedAt: number | null;
    onboardingCompletedAt: number | null;
    timezone: string | null;
  };
}

export async function getYweMemberSession(): Promise<YweMemberSession> {
  const response = await callYweMemberApi("/api/member/session");
  if (!response.ok) return { signedIn: false };
  return response.json() as Promise<YweMemberSession>;
}
