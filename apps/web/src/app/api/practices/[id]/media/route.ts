import { NextResponse } from "next/server";

import { getUserManualEntitlement } from "@/lib/entitlements";
import { canAccessPracticeUnlock, getCompletedLevelCount } from "@/lib/practice-access";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const SIGNED_MEDIA_TTL_SECONDS = 10 * 60;

function wantsJson(request: Request) {
  const url = new URL(request.url);
  return (
    url.searchParams.get("format") === "json" ||
    request.headers.get("accept")?.includes("application/json")
  );
}

function mediaResponse(request: Request, url: string) {
  if (wantsJson(request)) {
    return NextResponse.json({
      expiresIn: SIGNED_MEDIA_TTL_SECONDS,
      url,
    });
  }

  return NextResponse.redirect(url);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const entitlement = await getUserManualEntitlement();

  if (!entitlement.userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (!entitlement.entitled) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  const { id } = await context.params;
  const supabase = await createClient();
  const db = supabase as any;
  const { data: practice, error } = await db
    .from("practices")
    .select("id,title,media_url,pdf_url,storage_bucket,storage_path,unlock_level,is_published")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!practice) {
    return NextResponse.json({ error: "Practice not found" }, { status: 404 });
  }

  const completedLevelCount = await getCompletedLevelCount(entitlement.userId);
  if (!canAccessPracticeUnlock(completedLevelCount, practice.unlock_level)) {
    return NextResponse.json({ error: "Practice locked" }, { status: 403 });
  }

  const publicUrl = practice.media_url || practice.pdf_url;
  if (publicUrl) {
    return mediaResponse(request, new URL(publicUrl, request.url).toString());
  }

  if (!practice.storage_bucket || !practice.storage_path) {
    return NextResponse.json({ error: "Practice media is not configured" }, { status: 404 });
  }

  const service = createServiceClient();
  const { data, error: signedError } = await service.storage
    .from(practice.storage_bucket)
    .createSignedUrl(practice.storage_path, SIGNED_MEDIA_TTL_SECONDS);

  if (signedError || !data?.signedUrl) {
    return NextResponse.json(
      { error: signedError?.message ?? "Could not create signed URL" },
      { status: 500 },
    );
  }

  return mediaResponse(request, data.signedUrl);
}
