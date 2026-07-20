import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  getPracticeUniverse,
  getUniversePractices,
  getUniverseTutorial,
  practiceUniverses,
} from "@islands/content";

import { getDevAccessPreview } from "@/lib/dev-access-preview";
import { callYweMemberApi, getYweMemberSession } from "@/lib/ywe-member-api";
import { UniverseDetail } from "@/components/detail/UniverseDetail";
import { getUniverseDetailTheme } from "@/components/detail/UniverseDetail";
import {
  DetailGate,
  DetailGatePrimary,
  DetailGateSecondary,
  detailStyles,
} from "@/components/detail/DetailExperience";
import { ThemeProvider } from "@/themes/ThemeProvider";
import { dseTheme } from "@/themes/dse";
import { completeUniverse, registerReleaseInterest } from "./actions";

interface UniversePageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    error?: string;
    notification?: string;
    preview?: string;
  }>;
}

export function generateStaticParams() {
  return practiceUniverses.map((universe) => ({ slug: universe.slug }));
}

export default async function UniversePage({ params, searchParams }: UniversePageProps) {
  const { slug } = await params;
  const pageParams = await searchParams;
  const universe = getPracticeUniverse(slug);

  if (!universe) {
    notFound();
  }

  const tutorial = getUniverseTutorial(slug);
  if (!tutorial) notFound();

  const [session, devAccessPreview] = await Promise.all([
    getYweMemberSession(),
    getDevAccessPreview(),
  ]);
  const signedIn = session.signedIn || devAccessPreview.signedIn;
  const entitled = Boolean(session.access?.entitled) || devAccessPreview.entitled;
  const completedLevels = session.access?.completedLevels ?? [];
  const progressionReady =
    completedLevels.includes(universe.unlockAfterLevel) || devAccessPreview.fullAccess;
  const isDevComingSoonPreview =
    devAccessPreview.enabled && pageParams.preview === "coming-soon";

  if (!signedIn) {
    return (
      <UniverseGate
        action={<><DetailGatePrimary href={`/login?next=${encodeURIComponent(`/universes/${universe.slug}`)}`}>Log in or create an account</DetailGatePrimary><DetailGateSecondary>Back to The User Manual</DetailGateSecondary></>}
        body="This paid tutorial belongs to your shared Yoga With Ethan account. Log in to check your access."
        icon="account"
        state="Account required"
        title={universe.title}
        universe={universe}
      />
    );
  }

  if (!entitled) {
    return (
      <UniverseGate
        action={<><DetailGatePrimary href={`/paid?feature=${encodeURIComponent(universe.slug)}`}>Unlock The User Manual · $144</DetailGatePrimary><DetailGateSecondary>Not right now</DetailGateSecondary></>}
        body="One lifetime purchase unlocks all five paid tutorials, practice audio, comments, downloads, and future User Manual additions."
        icon="spark"
        state="Lifetime access required"
        title={universe.title}
        universe={universe}
      />
    );
  }

  if (isDevComingSoonPreview) {
    const interestResponse = session.signedIn
      ? await callYweMemberApi(`/api/release-interest/user-manual?tutorialSlug=${encodeURIComponent(universe.slug)}`)
      : null;
    const interest = interestResponse?.ok
      ? await interestResponse.json() as { emailEnabled?: boolean; telegramEnabled?: boolean }
      : null;
    const notificationRegistered =
      pageParams.notification === "registered" ||
      Boolean(interest?.emailEnabled || interest?.telegramEnabled);
    return <UniverseGate
      action={notificationRegistered ? <DetailGateSecondary>Back to The User Manual</DetailGateSecondary> : <><form action={registerReleaseInterest}><input type="hidden" name="slug" value={universe.slug} /><button className={detailStyles.gatePrimary} type="submit">Email me when it is ready</button></form><DetailGateSecondary>Back to The User Manual</DetailGateSecondary></>}
      body={`Your lifetime purchase already includes this tutorial. ${progressionReady ? "You have completed its required level." : `Complete Level ${universe.unlockAfterLevel} whenever you are ready.`}`}
      icon="clock"
      state="Coming soon"
      status={pageParams.error ? pageParams.error : notificationRegistered ? "You are on the release list. We will email you when it opens." : undefined}
      title={universe.title}
      universe={universe}
    />;
  }

  if (!progressionReady) {
    return (
      <UniverseGate
        action={<><DetailGatePrimary href={`/levels/${Math.min(completedLevels.length + 1, universe.unlockAfterLevel)}`}>Continue with Level {Math.min(completedLevels.length + 1, universe.unlockAfterLevel)}</DetailGatePrimary><DetailGateSecondary>Back to the roadmap</DetailGateSecondary></>}
        body={`You own this tutorial. It opens after you complete Level ${universe.unlockAfterLevel} of deeper. slower. easier.`}
        icon="lock"
        state="Progression locked"
        title={universe.title}
        universe={universe}
      />
    );
  }

  let universeStatus: "not_started" | "in_progress" | "completed" | undefined;
  if (session.signedIn) {
    const response = await callYweMemberApi("/api/progress/practices");
    if (response.ok) {
      const result = await response.json() as {
        practices?: Array<{ practice_id: string; status: "not_started" | "in_progress" | "completed" }>;
      };
      universeStatus = result.practices?.find(
        (item) => item.practice_id === universe.slug,
      )?.status;
    }
  }
  const universePractices = getUniversePractices(slug);
  return (
    <ThemeProvider theme={dseTheme} className="flex-1">
      <UniverseDetail
        completeAction={completeUniverse}
        completed={devAccessPreview.fullAccess || universeStatus === "completed"}
        practices={universePractices.map((practice) => ({
          description: practice.description,
          duration: practice.durationMinutes,
          href: `/universes/${universe.slug}/practices/${practice.id}`,
          id: practice.id,
          kind: practice.kind,
          title: practice.title,
        }))}
        sections={tutorial.sections}
        universe={universe}
      />
    </ThemeProvider>
  );
}

function UniverseGate({ action, body, icon, state, status, title, universe }: {
  action: ReactNode;
  body: string;
  icon: "account" | "clock" | "lock" | "spark";
  state: string;
  status?: ReactNode;
  title: string;
  universe: NonNullable<ReturnType<typeof getPracticeUniverse>>;
}) {
  return (
    <ThemeProvider theme={dseTheme} className="flex-1">
      <DetailGate action={action} body={body} icon={icon} logo={universe.logo} state={state} status={status} theme={getUniverseDetailTheme(universe)} title={title} transitionName={`detail-universe-${universe.slug}`} />
    </ThemeProvider>
  );
}
