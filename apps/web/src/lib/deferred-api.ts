import { NextResponse } from "next/server";

export function deferredUntilExperienceDesign(feature: string) {
  return NextResponse.json(
    {
      code: "deferred-until-experience-design",
      error: `${feature} will be introduced with the approved detail-page experience.`,
    },
    {
      headers: { "Cache-Control": "private, no-store" },
      status: 501,
    },
  );
}
