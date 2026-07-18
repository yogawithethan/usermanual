import { NextResponse } from "next/server";

import { getPublishedTutorial } from "@/lib/tutorial-content";

export async function GET(
  _request: Request,
  context: { params: Promise<{ level: string }> },
) {
  const { level } = await context.params;
  const tutorial = await getPublishedTutorial(level);

  if (!tutorial) {
    return NextResponse.json({ error: "Tutorial not found" }, { status: 404 });
  }

  return NextResponse.json({
    product: "the-user-manual",
    tutorial,
  });
}
