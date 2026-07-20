import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", "This sign-in attempt expired. Please continue with the shared Yoga With Ethan login.");
  return NextResponse.redirect(url);
}
