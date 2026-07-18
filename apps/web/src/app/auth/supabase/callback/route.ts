import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function safeReturnPath(value: string | null) {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return "/profile";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeReturnPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  const resetUrl = new URL("/reset-password", requestUrl.origin);
  resetUrl.searchParams.set("error", "The password reset link is invalid or expired.");
  return NextResponse.redirect(resetUrl);
}
