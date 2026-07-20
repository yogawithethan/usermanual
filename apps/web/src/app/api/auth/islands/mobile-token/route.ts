import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function POST() {
  return NextResponse.json(
    {
      code: "native-client-not-launched",
      error: "Native token exchange is not part of the web launch.",
    },
    { status: 410 },
  );
}
