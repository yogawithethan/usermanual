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
  const { data, error } = await db
    .from("user_notes")
    .select("id,tutorial_level,practice_id,body,created_at,updated_at")
    .eq("user_id", userId)
    .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notes: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const noteBody = String(body.body || "").trim();
  const tutorialLevel = body.tutorialLevel == null ? null : Number(body.tutorialLevel);
  const practiceId = body.practiceId ? String(body.practiceId) : null;

  if (noteBody.length < 1 || noteBody.length > 8000) {
    return NextResponse.json({ error: "Note must be 1-8000 characters" }, { status: 400 });
  }

  if (tutorialLevel !== null && (!Number.isInteger(tutorialLevel) || tutorialLevel < 1)) {
    return NextResponse.json({ error: "Invalid tutorialLevel" }, { status: 400 });
  }

  const db = supabase as any;
  const { data, error } = await db
    .from("user_notes")
    .insert({
      body: noteBody,
      practice_id: practiceId,
      product_slug: USER_MANUAL_PRODUCT_SLUG,
      tutorial_level: tutorialLevel,
      user_id: userId,
    })
    .select("id,tutorial_level,practice_id,body,created_at,updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ note: data }, { status: 201 });
}
