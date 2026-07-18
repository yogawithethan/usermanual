import { NextResponse } from "next/server";

import {
  USER_MANUAL_PRODUCT_SLUG,
  getUserManualEntitlement,
} from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ level: string }> },
) {
  const { level } = await context.params;
  const levelNumber = Number(level);

  if (!Number.isInteger(levelNumber) || levelNumber < 1) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }

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
    .from("lesson_questions")
    .select("id,body,is_resolved,created_at,lesson_answers(id,body,is_teacher_answer,created_at)")
    .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
    .eq("tutorial_level", levelNumber)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comments: data ?? [] });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ level: string }> },
) {
  const entitlement = await getUserManualEntitlement();
  if (!entitlement.userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (!entitlement.entitled) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { level } = await context.params;
  const levelNumber = Number(level);
  const body = await request.json().catch(() => ({}));
  const text = String(body.body || "").trim();

  if (!Number.isInteger(levelNumber) || levelNumber < 1) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }

  if (text.length < 3 || text.length > 2000) {
    return NextResponse.json({ error: "Comment must be 3-2000 characters" }, { status: 400 });
  }

  const db = supabase as any;
  const { data, error } = await db
    .from("lesson_questions")
    .insert({
      body: text,
      is_public: true,
      product_slug: USER_MANUAL_PRODUCT_SLUG,
      tutorial_level: levelNumber,
      user_id: userId,
    })
    .select("id,body,is_resolved,created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comment: data }, { status: 201 });
}
