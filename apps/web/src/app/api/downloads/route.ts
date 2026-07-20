import { NextResponse } from "next/server";
import { universeDownloads } from "@islands/content";

import { getUserManualEntitlement } from "@/lib/entitlements";

export async function GET() {
  const entitlement = await getUserManualEntitlement();
  if (!entitlement.userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (!entitlement.entitled) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }
  return NextResponse.json({ downloads: universeDownloads });
}
