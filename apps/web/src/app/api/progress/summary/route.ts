import { NextResponse } from "next/server";

import { USER_MANUAL_PRODUCT_SLUG } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const db = supabase as any;
  const [levels, practices, notes, photos] = await Promise.all([
    db
      .from("tutorial_progress")
      .select("level_number,status,started_at,completed_at,updated_at")
      .eq("user_id", userId)
      .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
      .order("level_number", { ascending: true }),
    db
      .from("practice_progress")
      .select("practice_id,status,last_completed_at,completion_count,updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    db
      .from("user_notes")
      .select("id,tutorial_level,practice_id,body,created_at,updated_at")
      .eq("user_id", userId)
      .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
      .order("updated_at", { ascending: false })
      .limit(50),
    db
      .from("progress_photos")
      .select("id,storage_path,label,taken_at,created_at")
      .eq("user_id", userId)
      .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const firstError = [levels, practices, notes, photos].find((result) => result.error)?.error;
  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 });
  }

  return NextResponse.json({
    levels: levels.data ?? [],
    notes: notes.data ?? [],
    photos: (photos.data ?? []).map((photo: any) => ({
      ...photo,
      href: `/api/progress/photos/${photo.id}`,
    })),
    practices: practices.data ?? [],
  });
}
