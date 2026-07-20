import { NextResponse } from "next/server";
import { universePractices } from "@islands/content";

import { getYweMemberSession } from "@/lib/ywe-member-api";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getYweMemberSession();
  if (!session.signedIn) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (!session.access?.entitled) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }
  const { id } = await context.params;
  const practice = universePractices.find((item) => item.id === id);
  if (!practice) return NextResponse.json({ error: "Practice not found" }, { status: 404 });
  const unlockLevel = practice.universeSlug === "wake-the-fck-up" ? 1
    : practice.universeSlug === "prana-fusion" ? 2
      : practice.universeSlug === "yoga-reset" ? 3
        : practice.universeSlug === "gravity-yoga" ? 4 : 5;
  if (!session.access.completedLevels.includes(unlockLevel)) {
    return NextResponse.json({ error: "Complete the prerequisite level first", state: "purchased-progression-locked" }, { status: 403 });
  }
  return NextResponse.json({ error: "Practice media is coming soon" }, { status: 404 });
}
