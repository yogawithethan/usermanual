import { deferredUntilExperienceDesign } from "@/lib/deferred-api";

export const dynamic = "force-dynamic";

export function GET() {
  return deferredUntilExperienceDesign("Private notes");
}

export function POST() {
  return deferredUntilExperienceDesign("Private notes");
}
