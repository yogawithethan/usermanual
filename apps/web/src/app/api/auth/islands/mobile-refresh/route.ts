import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const refreshToken = String(body.refreshToken || "");

  if (!refreshToken) {
    return NextResponse.json({ error: "refreshToken is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session?.access_token || !data.session.refresh_token) {
    return NextResponse.json(
      { error: error?.message ?? "The mobile session could not be refreshed." },
      { status: 401 },
    );
  }

  return NextResponse.json({
    accessToken: data.session.access_token,
    expiresAt: data.session.expires_at ?? null,
    refreshToken: data.session.refresh_token,
  });
}
