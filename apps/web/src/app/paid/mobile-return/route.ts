import { NextRequest, NextResponse } from "next/server";

import { allowedMobileCheckoutReturnTo } from "@/lib/mobile-checkout";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const returnTo = requestUrl.searchParams.get("return_to");
  const status = requestUrl.searchParams.get("status") === "cancel" ? "cancel" : "success";
  const sessionId = requestUrl.searchParams.get("session_id");

  if (!allowedMobileCheckoutReturnTo(returnTo)) {
    return NextResponse.json({ error: "Unsupported mobile checkout return URL" }, { status: 400 });
  }

  const redirectUrl = new URL(returnTo!);
  redirectUrl.searchParams.set("status", status);
  if (sessionId) redirectUrl.searchParams.set("session_id", sessionId);

  return NextResponse.redirect(redirectUrl);
}
