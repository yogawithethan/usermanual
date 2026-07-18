import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const PHOTO_BUCKET = "progress-photos";
const SIGNED_PHOTO_TTL_SECONDS = 5 * 60;

function wantsJson(request: Request) {
  const url = new URL(request.url);
  return (
    url.searchParams.get("format") === "json" ||
    request.headers.get("accept")?.includes("application/json")
  );
}

function photoResponse(request: Request, url: string) {
  if (wantsJson(request)) {
    return NextResponse.json({
      expiresIn: SIGNED_PHOTO_TTL_SECONDS,
      url,
    });
  }

  return NextResponse.redirect(url);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await context.params;
  const db = supabase as any;
  const { data: photo, error } = await db
    .from("progress_photos")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  const service = createServiceClient();
  const { data, error: signedError } = await service.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(photo.storage_path, SIGNED_PHOTO_TTL_SECONDS);

  if (signedError || !data?.signedUrl) {
    return NextResponse.json(
      { error: signedError?.message ?? "Could not create signed URL" },
      { status: 500 },
    );
  }

  return photoResponse(request, data.signedUrl);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await context.params;
  const db = supabase as any;
  const { data: photo, error: lookupError } = await db
    .from("progress_photos")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 });
  }

  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  const { error } = await db
    .from("progress_photos")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await createServiceClient().storage.from(PHOTO_BUCKET).remove([photo.storage_path]);
  return NextResponse.json({ ok: true });
}
