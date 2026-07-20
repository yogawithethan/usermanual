import { NextResponse } from "next/server";

import { getYweMemberSession } from "@/lib/ywe-member-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getYweMemberSession();
  if (!session.signedIn) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  return NextResponse.json(
    {
      completedLevels: session.access?.completedLevels ?? [],
      levelProgress: session.access?.levelProgress ?? [],
      photos: [],
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
