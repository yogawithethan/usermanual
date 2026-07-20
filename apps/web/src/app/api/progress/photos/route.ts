import { deferredUntilExperienceDesign } from "@/lib/deferred-api";

export const dynamic = "force-dynamic";

export function GET() {
  return deferredUntilExperienceDesign("Progress photos");
}

export function POST() {
  return deferredUntilExperienceDesign("Progress photos");
}
