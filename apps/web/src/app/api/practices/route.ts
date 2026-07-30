import { NextResponse } from "next/server";
import { getUniversePractices, universePractices } from "@islands/content";

import { getUserManualEntitlement } from "@/lib/entitlements";
import { universeHref } from "@/lib/universe-routing";

export async function GET(request: Request) {
  const entitlement = await getUserManualEntitlement();
  if (!entitlement.userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (!entitlement.entitled) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }
  const universe = new URL(request.url).searchParams.get("universe");
  const practices = universe ? getUniversePractices(universe) : universePractices;
  return NextResponse.json({
    practices: practices.map((practice) => ({
      bodyArea: practice.bodyArea,
      description: practice.description,
      durationMinutes: practice.durationMinutes,
      goal: practice.goal,
      id: practice.id,
      intensity: practice.intensity,
      kind: practice.kind,
      pageHref: universeHref(practice.universeSlug, `/practices/${practice.id}`),
      releaseStatus: practice.releaseStatus,
      title: practice.title,
      universeSlug: practice.universeSlug,
    })),
  });
}
