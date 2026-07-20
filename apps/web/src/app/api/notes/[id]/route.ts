import { deferredUntilExperienceDesign } from "@/lib/deferred-api";

export const dynamic = "force-dynamic";

export function PATCH() {
  return deferredUntilExperienceDesign("Private notes");
}

export function DELETE() {
  return deferredUntilExperienceDesign("Private notes");
}
