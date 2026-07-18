import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  _context: { params: Promise<{ id: string }> },
) {
  return NextResponse.json(
    { error: "Lesson answers are currently teacher-managed." },
    { status: 403 },
  );
}
