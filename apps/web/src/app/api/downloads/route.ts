import { NextResponse } from "next/server";

import { USER_MANUAL_PRODUCT_SLUG, getUserManualEntitlement } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const entitlement = await getUserManualEntitlement();

  if (!entitlement.userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (!entitlement.entitled) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  const supabase = await createClient();
  const db = supabase as any;
  const { data, error } = await db
    .from("product_downloads")
    .select("id,title,description,sort_order,tutorial_level_id,file_url,storage_bucket,storage_path")
    .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    downloads: (data ?? []).map((download: any) => ({
      description: download.description,
      href: `/api/downloads/${download.id}`,
      id: download.id,
      isPrivate: Boolean(download.storage_bucket && download.storage_path),
      sortOrder: download.sort_order,
      title: download.title,
      tutorialLevelId: download.tutorial_level_id,
    })),
  });
}
