import { NextResponse } from "next/server";
import { universeDownloads } from "@islands/content";

import { getUserManualEntitlement } from "@/lib/entitlements";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const entitlement = await getUserManualEntitlement();
  if (!entitlement.userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (!entitlement.entitled) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }
  const { id } = await context.params;
  if (!universeDownloads.some((item) => item.id === id)) {
    return NextResponse.json({ error: "Download not found" }, { status: 404 });
  }
  return NextResponse.json({ error: "Download is coming soon" }, { status: 404 });
}
