import { NextResponse } from "next/server";

/** Retained only so stale bookmarks cannot recreate a legacy Supabase session. */
export function GET(request: Request) {
  const target = new URL("/login", request.url);
  target.searchParams.set("message", "Please continue with your shared Yoga With Ethan account.");
  return NextResponse.redirect(target, 307);
}
