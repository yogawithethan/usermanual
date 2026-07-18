import { NextResponse } from "next/server";

import { getUserManualEntitlement } from "@/lib/entitlements";
import { canAccessPracticeUnlock, getCompletedLevelCount } from "@/lib/practice-access";
import { createClient } from "@/lib/supabase/server";

const allowedStatuses = new Set(["not_started", "in_progress", "completed"]);

export async function GET() {
  const entitlement = await getUserManualEntitlement();

  if (!entitlement.userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const supabase = await createClient();
  const db = supabase as any;
  const { data, error } = await db
    .from("practice_progress")
    .select("practice_id,status,last_completed_at,completion_count,updated_at")
    .eq("user_id", entitlement.userId)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ practices: data ?? [] });
}

export async function PATCH(request: Request) {
  const entitlement = await getUserManualEntitlement();

  if (!entitlement.userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const practiceId = String(body.practiceId || "");
  const status = String(body.status || "");

  if (!practiceId) {
    return NextResponse.json({ error: "practiceId is required" }, { status: 400 });
  }

  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const supabase = await createClient();
  const db = supabase as any;
  const { data: practice, error: practiceError } = await db
    .from("practices")
    .select("id,is_paid,is_published,unlock_level")
    .eq("id", practiceId)
    .eq("is_published", true)
    .maybeSingle();

  if (practiceError) {
    return NextResponse.json({ error: practiceError.message }, { status: 500 });
  }

  if (!practice) {
    return NextResponse.json({ error: "Practice not found" }, { status: 404 });
  }

  if (practice.is_paid && !entitlement.entitled) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  const completedLevelCount = await getCompletedLevelCount(entitlement.userId);
  if (!canAccessPracticeUnlock(completedLevelCount, practice.unlock_level)) {
    return NextResponse.json({ error: "Practice locked" }, { status: 403 });
  }

  const { data: existing, error: existingError } = await db
    .from("practice_progress")
    .select("completion_count,last_completed_at")
    .eq("user_id", entitlement.userId)
    .eq("practice_id", practiceId)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const now = new Date().toISOString();
  const completionCount =
    Number(existing?.completion_count || 0) + (status === "completed" ? 1 : 0);

  const { data, error } = await db
    .from("practice_progress")
    .upsert(
      {
        completion_count: completionCount,
        last_completed_at: status === "completed" ? now : existing?.last_completed_at ?? null,
        practice_id: practiceId,
        status,
        user_id: entitlement.userId,
      },
      { onConflict: "user_id,practice_id" },
    )
    .select("practice_id,status,last_completed_at,completion_count,updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ practice: data });
}
