import { NextResponse } from "next/server";

import { USER_MANUAL_PRODUCT_SLUG } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { safeStorageName } from "@/lib/storage-path";

const PHOTO_BUCKET = "progress-photos";

export async function GET() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const db = supabase as any;
  const { data, error } = await db
    .from("progress_photos")
    .select("id,storage_path,label,taken_at,created_at")
    .eq("user_id", userId)
    .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    photos: (data ?? []).map((photo: any) => ({
      ...photo,
      href: `/api/progress/photos/${photo.id}`,
    })),
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const label = String(form.get("label") || "").trim() || null;
  const takenAt = String(form.get("takenAt") || "").trim() || null;

  if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({ error: "Photo file is required" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are supported" }, { status: 400 });
  }

  const storagePath = [
    "user-manual",
    "progress",
    userId,
    `${Date.now()}-${safeStorageName(file.name || "progress-photo")}`,
  ].join("/");

  const service = createServiceClient();
  const { error: uploadError } = await service.storage
    .from(PHOTO_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const db = supabase as any;
  const { data, error } = await db
    .from("progress_photos")
    .insert({
      label,
      product_slug: USER_MANUAL_PRODUCT_SLUG,
      storage_path: storagePath,
      taken_at: takenAt,
      user_id: userId,
    })
    .select("id,storage_path,label,taken_at,created_at")
    .single();

  if (error) {
    await service.storage.from(PHOTO_BUCKET).remove([storagePath]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { photo: { ...data, href: `/api/progress/photos/${data.id}` } },
    { status: 201 },
  );
}
