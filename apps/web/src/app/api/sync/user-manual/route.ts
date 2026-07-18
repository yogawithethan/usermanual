import { NextResponse } from "next/server";

import { USER_MANUAL_PRODUCT_SLUG, getUserManualEntitlement } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

function syncVersionFrom(rows: Array<Row[] | Row | null | undefined>) {
  const timestamps = rows
    .flatMap((items) => (Array.isArray(items) ? items : items ? [items] : []))
    .map((item) => item.updated_at || item.created_at || item.completed_at || item.last_completed_at)
    .filter(Boolean)
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value));

  if (!timestamps.length) {
    return new Date(0).toISOString();
  }

  return new Date(Math.max(...timestamps)).toISOString();
}

function syncEtag(syncVersion: string, userId: string) {
  return `"um-sync-v1-${userId}-${syncVersion}"`;
}

function syncHeaders(syncVersion: string, etag: string) {
  return {
    "Cache-Control": "private, no-store",
    ETag: etag,
    "X-Sync-Version": syncVersion,
  };
}

function requestHasMatchingEtag(request: Request, etag: string) {
  const header = request.headers.get("if-none-match");
  if (!header) return false;

  return header
    .split(",")
    .map((value) => value.trim())
    .some((value) => value === etag || value === `W/${etag}`);
}

async function getSyncPayload(request: Request) {
  const entitlement = await getUserManualEntitlement();

  if (!entitlement.userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const supabase = await createClient();
  const db = supabase as any;
  const [
    profileResult,
    levelsResult,
    practicesResult,
    notesResult,
    photosResult,
    questionsResult,
  ] = await Promise.all([
    db
      .from("profiles")
      .select("id,email,display_name,avatar_url,timezone,primary_goal,welcome_completed_at,onboarding_completed_at,updated_at")
      .eq("id", entitlement.userId)
      .maybeSingle(),
    db
      .from("tutorial_progress")
      .select("level_number,status,started_at,completed_at,updated_at")
      .eq("user_id", entitlement.userId)
      .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
      .order("level_number", { ascending: true }),
    db
      .from("practice_progress")
      .select("practice_id,status,last_completed_at,completion_count,updated_at")
      .eq("user_id", entitlement.userId)
      .order("updated_at", { ascending: false }),
    db
      .from("user_notes")
      .select("id,tutorial_level,practice_id,body,created_at,updated_at")
      .eq("user_id", entitlement.userId)
      .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
      .order("updated_at", { ascending: false }),
    db
      .from("progress_photos")
      .select("id,storage_path,label,taken_at,created_at")
      .eq("user_id", entitlement.userId)
      .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
      .order("created_at", { ascending: false }),
    db
      .from("lesson_questions")
      .select("id,tutorial_level,body,is_public,is_resolved,created_at,updated_at")
      .eq("user_id", entitlement.userId)
      .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
      .order("updated_at", { ascending: false }),
  ]);

  const firstError = [
    profileResult,
    levelsResult,
    practicesResult,
    notesResult,
    photosResult,
    questionsResult,
  ].find((result) => result.error)?.error;

  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 });
  }

  const syncVersion = syncVersionFrom([
    profileResult.data,
    levelsResult.data,
    practicesResult.data,
    notesResult.data,
    photosResult.data,
    questionsResult.data,
  ]);
  const etag = syncEtag(syncVersion, entitlement.userId);
  const headers = syncHeaders(syncVersion, etag);

  if (requestHasMatchingEtag(request, etag)) {
    return new NextResponse(null, { headers, status: 304 });
  }

  return NextResponse.json(
    {
      access: {
        entitled: entitlement.entitled,
        productSlug: USER_MANUAL_PRODUCT_SLUG,
      },
      generatedAt: new Date().toISOString(),
      profile: profileResult.data
        ? {
            avatarUrl: profileResult.data.avatar_url,
            displayName: profileResult.data.display_name,
            email: profileResult.data.email,
            id: profileResult.data.id,
            onboardingCompletedAt: profileResult.data.onboarding_completed_at,
            primaryGoal: profileResult.data.primary_goal,
            timezone: profileResult.data.timezone,
            updatedAt: profileResult.data.updated_at,
            welcomeCompletedAt: profileResult.data.welcome_completed_at,
          }
        : null,
      progress: {
        levels: levelsResult.data ?? [],
        practices: practicesResult.data ?? [],
      },
      questions: questionsResult.data ?? [],
      schemaVersion: 1,
      syncVersion,
      userContent: {
        notes: notesResult.data ?? [],
        photos: (photosResult.data ?? []).map((photo: Row) => ({
          ...photo,
          href: `/api/progress/photos/${photo.id}`,
        })),
      },
    },
    { headers },
  );
}

export async function GET(request: Request) {
  return getSyncPayload(request);
}

export async function HEAD(request: Request) {
  const response = await getSyncPayload(request);

  return new NextResponse(null, {
    headers: response.headers,
    status: response.status,
  });
}
