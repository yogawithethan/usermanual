import { NextResponse } from "next/server";

import { proxyYweMemberApi } from "@/lib/ywe-member-api";

function validLevel(value: string) {
  const level = Number(value);
  return Number.isInteger(level) && level >= 1 && level <= 6;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ level: string }> },
) {
  const { level } = await context.params;
  if (!validLevel(level)) return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  return proxyYweMemberApi(request, `/api/lessons/${level}/comments`);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ level: string }> },
) {
  const { level } = await context.params;
  if (!validLevel(level)) return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  return proxyYweMemberApi(request, `/api/lessons/${level}/comments`);
}
