import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { callYweMemberApi, getYweMemberSession } from "@/lib/ywe-member-api";

export const dynamic = "force-dynamic";

async function syncResponse(request: Request) {
  const session = await getYweMemberSession();
  if (!session.signedIn) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const practicesResponse = await callYweMemberApi("/api/progress/practices");
  const practices = practicesResponse.ok
    ? (((await practicesResponse.json()) as { practices?: unknown[] }).practices ?? [])
    : [];
  const payload = {
    access: { entitled: Boolean(session.access?.entitled), productSlug: "the-user-manual" },
    generatedAt: new Date().toISOString(),
    profile: {
      displayName: session.member?.displayName ?? null,
      email: session.member?.email ?? null,
      onboardingCompletedAt: session.profile?.onboardingCompletedAt ?? null,
      timezone: session.profile?.timezone ?? null,
      welcomeCompletedAt: session.profile?.welcomeCompletedAt ?? null,
    },
    progress: {
      levels: session.access?.levelProgress ?? [],
      practices,
    },
    questions: [],
    schemaVersion: 1,
    userContent: { notes: [], photos: [] },
  };
  const stable = JSON.stringify({ ...payload, generatedAt: undefined });
  const syncVersion = createHash("sha256").update(stable).digest("hex").slice(0, 20);
  const etag = `"um-sync-v2-${syncVersion}"`;
  const headers = { "Cache-Control": "private, no-store", ETag: etag, "X-Sync-Version": syncVersion };
  const matches = request.headers.get("if-none-match")?.split(",").map((value) => value.trim()).some((value) => value === etag || value === `W/${etag}`);
  if (matches) return new NextResponse(null, { headers, status: 304 });
  return NextResponse.json({ ...payload, syncVersion }, { headers });
}

export async function GET(request: Request) {
  return syncResponse(request);
}

export async function HEAD(request: Request) {
  const response = await syncResponse(request);
  return new NextResponse(null, { headers: response.headers, status: response.status });
}
