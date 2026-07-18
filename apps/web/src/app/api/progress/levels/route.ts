import { NextResponse } from "next/server";

import { USER_MANUAL_PRODUCT_SLUG } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";

const allowedStatuses = new Set(["not_started", "in_progress", "completed"]);

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const levelNumber = Number(body.levelNumber);
  const status = String(body.status || "");

  if (!Number.isInteger(levelNumber) || levelNumber < 1) {
    return NextResponse.json({ error: "Invalid levelNumber" }, { status: 400 });
  }

  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const db = supabase as any;
  const { data: existingProgress, error: progressError } = await db
    .from("tutorial_progress")
    .select("level_number,status,started_at")
    .eq("user_id", userId)
    .eq("product_slug", USER_MANUAL_PRODUCT_SLUG);

  if (progressError) {
    return NextResponse.json({ error: progressError.message }, { status: 500 });
  }

  const completedLevelCount =
    existingProgress?.filter((item: any) => item.status === "completed").length ?? 0;

  if (status !== "not_started" && levelNumber > completedLevelCount + 1) {
    return NextResponse.json(
      { error: "Previous levels must be completed first" },
      { status: 403 },
    );
  }

  const existingLevel = existingProgress?.find(
    (item: any) => item.level_number === levelNumber,
  );
  const now = new Date().toISOString();
  const payload = {
    completed_at: status === "completed" ? now : null,
    level_number: levelNumber,
    product_slug: USER_MANUAL_PRODUCT_SLUG,
    started_at: status === "not_started" ? null : existingLevel?.started_at ?? now,
    status,
    user_id: userId,
  };

  const { data, error } = await db
    .from("tutorial_progress")
    .upsert(payload, { onConflict: "user_id,product_slug,level_number" })
    .select("level_number,status,started_at,completed_at,updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ progress: data });
}
