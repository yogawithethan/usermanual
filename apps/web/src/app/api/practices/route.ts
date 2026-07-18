import { NextResponse } from "next/server";

import { USER_MANUAL_PRODUCT_SLUG, getUserManualEntitlement } from "@/lib/entitlements";
import { getCompletedLevelCount } from "@/lib/practice-access";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const universe = url.searchParams.get("universe");
  const entitlement = await getUserManualEntitlement();

  if (!entitlement.userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (!entitlement.entitled) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  const completedLevelCount = await getCompletedLevelCount(entitlement.userId);
  const supabase = await createClient();
  const db = supabase as any;
  let query = db
    .from("practices")
    .select("id,universe_slug,title,description,duration_minutes,media_kind,media_url,pdf_url,body_areas,goals,intensity,safety_notes,thumbnail_url,storage_bucket,storage_path,sort_order,unlock_level")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (universe) {
    query = query.eq("universe_slug", universe);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    practices: (data ?? []).map((practice: any) => ({
      ...practice,
      href: `/api/practices/${practice.id}/media`,
      isAvailable: completedLevelCount >= (practice.unlock_level ?? 1),
      productSlug: USER_MANUAL_PRODUCT_SLUG,
    })),
  });
}
