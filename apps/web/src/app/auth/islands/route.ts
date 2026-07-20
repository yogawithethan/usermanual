import { NextRequest, NextResponse } from "next/server";

import { getYweWorkerOrigin } from "@/lib/ywe-member-api";
import { safeAuthMode, safeReturnPath } from "@/lib/islands-sso";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const next = safeReturnPath(requestUrl.searchParams.get("next"));
  const mode = safeAuthMode(requestUrl.searchParams.get("mode"));
  const start = new URL("/auth/islands/start", getYweWorkerOrigin());
  start.searchParams.set("mode", mode);
  start.searchParams.set("return", `${requestUrl.origin}${next}`);
  return NextResponse.redirect(start);
}
