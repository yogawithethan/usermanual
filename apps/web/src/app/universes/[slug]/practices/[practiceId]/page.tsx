import { notFound } from "next/navigation";
import {
  getPracticeUniverse,
  getUniversePractice,
  universePractices,
} from "@islands/content";

import { PracticeDetailView, type WorldAccessState } from "@/components/worlds/WorldExperience";
import { getYweMemberSession } from "@/lib/ywe-member-api";
import { getDevAccessPreview } from "@/lib/dev-access-preview";
import { ThemeProvider } from "@/themes/ThemeProvider";
import { dseTheme } from "@/themes/dse";

interface PracticePageProps {
  params: Promise<{ practiceId: string; slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export function generateStaticParams() {
  return universePractices.map((practice) => ({
    practiceId: practice.id,
    slug: practice.universeSlug,
  }));
}

export default async function PracticePage({ params, searchParams }: PracticePageProps) {
  const [{ practiceId, slug }, query] = await Promise.all([params, searchParams]);
  const universe = getPracticeUniverse(slug);
  const practice = getUniversePractice(slug, practiceId);
  if (!universe || !practice) notFound();

  const [session, devAccessPreview] = await Promise.all([getYweMemberSession(), getDevAccessPreview()]);
  const completedLevels = session.access?.completedLevels ?? [];
  const progressionReady = completedLevels.includes(universe.unlockAfterLevel) || devAccessPreview.fullAccess;
  const entitled = Boolean(session.access?.entitled) || devAccessPreview.entitled;
  const signedIn = Boolean(session.signedIn) || devAccessPreview.signedIn;
  let accessState: WorldAccessState;
  if (!signedIn) accessState = "account-required";
  else if (entitled && !progressionReady) accessState = "purchased-progression-locked";
  else if (!entitled && progressionReady) accessState = "payment-locked";
  else if (!entitled) accessState = "progression-locked";
  else accessState = "available";
  if (devAccessPreview.enabled && ["account-required", "progression-locked", "payment-locked", "purchased-progression-locked", "available"].includes(query.preview ?? "")) {
    accessState = query.preview as WorldAccessState;
  }

  return (
    <ThemeProvider theme={dseTheme} className="flex-1">
      <PracticeDetailView
        accessState={accessState}
        completedLevelCount={query.preview === "available" || devAccessPreview.fullAccess ? universe.unlockAfterLevel : completedLevels.length}
        member={(query.preview && query.preview !== "account-required") || devAccessPreview.signedIn ? { displayName: "Preview member", email: "preview@yogawithethan.com" } : session.signedIn ? {
          displayName: session.member?.displayName ?? undefined,
          email: session.member?.email,
        } : undefined}
        practice={practice}
        universe={universe}
      />
    </ThemeProvider>
  );
}
