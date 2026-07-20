import { redirect } from "next/navigation";

import { getYweMemberSession } from "@/lib/ywe-member-api";

interface OnboardingPageProps {
  searchParams: Promise<{ next?: string }>;
}

/**
 * Legacy User Manual onboarding is intentionally retired. Identity and profile
 * setup belong to Islands; the only product-specific prerequisite is the
 * welcome experience recorded by the YWE Worker.
 */
export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//")
    ? params.next
    : "/levels/1";
  const session = await getYweMemberSession();
  if (!session.signedIn) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  redirect(next);
}
