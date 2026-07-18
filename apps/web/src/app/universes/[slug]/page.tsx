import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getPracticeUniverse } from "@islands/content";

import { getUserManualEntitlement } from "@/lib/entitlements";
import { getCompletedLevelCount } from "@/lib/practice-access";
import {
  DEV_PROGRESS_COOKIE,
  DEV_AUTH_COOKIE,
  DEV_PREMIUM_COOKIE,
  devCompletedLevelCount,
  normalizeDevProgressMode,
} from "@/lib/dev-progress";
import { createClient } from "@/lib/supabase/server";
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

interface UniverseSectionRow {
  id: string;
  paragraphs: unknown;
  slug: string;
  title: string;
}

interface UniversePracticeRow {
  body_areas: string[] | null;
  description: string | null;
  duration_minutes: number | null;
  goals: string[] | null;
  id: string;
  intensity: string | null;
  media_kind: string;
  safety_notes: string | null;
  sort_order: number | null;
  title: string;
  unlock_level: number | null;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export default async function UniversePage({ params, searchParams }: UniversePageProps) {
  const { slug } = await params;
  const pageParams = await searchParams;
  const universe = getPracticeUniverse(slug);

  if (!universe) {
    notFound();
  }

  const cookieStore = await cookies();
  const isDev = process.env.NODE_ENV !== "production";
  const devProgressMode = isDev
    ? normalizeDevProgressMode(cookieStore.get(DEV_PROGRESS_COOKIE)?.value)
    : "real";
  const isDevProgressOverride = devProgressMode !== "real";
  const isDevAccountOverride = isDev && cookieStore.get(DEV_AUTH_COOKIE)?.value === "1";
  const isDevPremiumOverride = isDev && cookieStore.get(DEV_PREMIUM_COOKIE)?.value === "1";
  const isDevComingSoonPreview = isDev && pageParams.preview === "coming-soon";
  const isDevDataPreview =
    isDevAccountOverride && isDevPremiumOverride && isDevProgressOverride;
  const auth = isDevAccountOverride && isDevPremiumOverride
    ? { entitled: false, userId: null }
    : await getUserManualEntitlement();
  const { entitled, userId } = auth;
  const canPreviewAccount = Boolean(userId) || isDevAccountOverride;
  const canPreviewPremium = entitled || isDevPremiumOverride;

  if (!canPreviewAccount) {
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

  if (!canPreviewPremium) {
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

  const supabase = await createClient();
  const db = supabase as any;
  const [{ data: release }, completedLevelCount] = await Promise.all([
    isDevAccountOverride && isDevPremiumOverride
      ? Promise.resolve({ data: { release_status: "available" } })
      : supabase
          .from("practice_universes")
          .select("release_status")
          .eq("slug", universe.slug)
          .eq("product_slug", "the-user-manual")
          .single(),
    isDevProgressOverride
      ? Promise.resolve(devCompletedLevelCount(devProgressMode, 0))
      : getCompletedLevelCount(userId!),
  ]);

  if (release?.release_status === "coming_soon" || isDevComingSoonPreview) {
    const { data: interest } = userId ? await supabase
      .from("content_release_interests")
      .select("id")
      .eq("user_id", userId)
      .eq("universe_slug", universe.slug)
      .maybeSingle() : { data: null };

    const notificationRegistered = pageParams.notification === "registered" || Boolean(interest);
    return <UniverseGate
      action={notificationRegistered ? <DetailGateSecondary>Back to The User Manual</DetailGateSecondary> : <><form action={registerReleaseInterest}><input type="hidden" name="slug" value={universe.slug} /><button className={detailStyles.gatePrimary} type="submit">Email me when it is ready</button></form><DetailGateSecondary>Back to The User Manual</DetailGateSecondary></>}
      body={`Your lifetime purchase already includes this tutorial. ${completedLevelCount >= universe.unlockAfterLevel ? "You have completed its required level." : `Complete Level ${universe.unlockAfterLevel} whenever you are ready.`}`}
      icon="clock"
      state="Coming soon"
      status={pageParams.error ? pageParams.error : notificationRegistered ? "You are on the release list. We will email you when it opens." : undefined}
      title={universe.title}
      universe={universe}
    />;
  }

  if (completedLevelCount < universe.unlockAfterLevel) {
    return (
      <UniverseGate
        action={<><DetailGatePrimary href={`/levels/${completedLevelCount + 1}`}>Continue with Level {completedLevelCount + 1}</DetailGatePrimary><DetailGateSecondary>Back to the roadmap</DetailGateSecondary></>}
        body={`You own this tutorial. It opens after you complete Level ${universe.unlockAfterLevel} of deeper. slower. easier.`}
        icon="lock"
        state="Progression locked"
        title={universe.title}
        universe={universe}
      />
    );
  }

  const [{ data: sections }, { data: practices }, { data: universeProgress }] = await Promise.all([
    isDevDataPreview
      ? Promise.resolve({ data: [] })
      : db
          .from("practice_universe_sections")
          .select("id,slug,title,paragraphs,sort_order")
          .eq("universe_slug", universe.slug)
          .eq("is_published", true)
          .order("sort_order", { ascending: true }),
    isDevDataPreview
      ? Promise.resolve({ data: [] })
      : db
          .from("practices")
          .select("id,title,description,duration_minutes,media_kind,body_areas,goals,intensity,safety_notes,unlock_level,sort_order")
          .eq("universe_slug", universe.slug)
          .eq("is_published", true)
          .order("sort_order", { ascending: true }),
    userId && !isDevDataPreview
      ? db
          .from("practice_universe_progress")
          .select("status")
          .eq("user_id", userId)
          .eq("product_slug", "the-user-manual")
          .eq("universe_slug", universe.slug)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  const universeSections = ((sections ?? []) as UniverseSectionRow[]).length
    ? ((sections ?? []) as UniverseSectionRow[]).map((section) => ({
        id: section.slug,
        paragraphs: asStringArray(section.paragraphs),
        title: section.title,
      }))
    : universe.sections;
  const universePractices = (practices ?? []) as UniversePracticeRow[];
  return (
    <ThemeProvider theme={dseTheme} className="flex-1">
      <UniverseDetail
        completeAction={completeUniverse}
        completed={devProgressMode === "all" || universeProgress?.status === "completed"}
        practices={universePractices.map((practice) => ({
          description: practice.description,
          duration: practice.duration_minutes,
          href: `/api/practices/${practice.id}/media`,
          id: practice.id,
          kind: practice.media_kind,
          title: practice.title,
        }))}
        sections={universeSections}
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
