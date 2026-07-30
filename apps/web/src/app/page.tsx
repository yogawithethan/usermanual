import {
  CloudButton,
  StatusChip,
  type CloudButtonProps,
  type CloudButtonState,
  type CloudButtonTint,
} from "@/components/molecules/CloudButton";
import { StatusTooltip } from "@/components/ui/StatusTooltip";
import { SystemIcon } from "@/components/ui/SystemIcon";
import Link from "next/link";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/themes/ThemeProvider";
import { dseTheme } from "@/themes/dse";
import { WELCOME_COMPLETED_COOKIE } from "@/lib/welcome";
import { getDevAccessPreview } from "@/lib/dev-access-preview";
import { getYweMemberSession } from "@/lib/ywe-member-api";
import { UniverseAtmosphere } from "@/components/motion/UniverseAtmosphere";
import { universeHref } from "@/lib/universe-routing";
import { practiceUniverses, type PracticeUniverse } from "@islands/content";
import {
  DEV_PROGRESS_COOKIE,
  devCompletedLevelCount,
  normalizeDevProgressMode,
} from "@/lib/dev-progress";
import { ViewTransition, type CSSProperties } from "react";
import { LibraryModeSwitcher, type LibraryMode } from "@/components/library/LibraryModeSwitcher";
import { HomeLibraryView } from "@/components/library/HomeLibraryViews";
import styles from "./page.module.css";

interface LevelSpec {
  title: string;
  subtitle?: string;
  state: CloudButtonState;
  tint: CloudButtonTint;
}

interface HomePageProps {
  searchParams: Promise<{
    kind?: string;
    mode?: string;
    q?: string;
    world?: string;
  }>;
}

const LIBRARY_MODE_VALUES = ["tutorial", "practice", "faqs", "downloads"] as const;

function normalizeLibraryMode(value?: string): LibraryMode {
  return LIBRARY_MODE_VALUES.includes(value as LibraryMode) ? value as LibraryMode : "tutorial";
}

// Progression ladder: saturated royal blue → indigo → violet → purple
// → cool gray → deep gray. Each step mirrors the reference mockup.
const LEVELS: LevelSpec[] = [
  { title: "level 1", subtitle: "upright & confident", state: "completed",   tint: { skyTop: "#2678CC", skyBottom: "#1E68B6" } },
  { title: "level 2", subtitle: "grounded & aware",    state: "completed",   tint: { skyTop: "#4A67B4", skyBottom: "#3C59A6" } },
  { title: "level 3", subtitle: "breath & stillness",  state: "completed",   tint: { skyTop: "#6958A6", skyBottom: "#5B4A97" } },
  { title: "level 4", subtitle: "strength & surrender",state: "in-progress", tint: { skyTop: "#8A4B99", skyBottom: "#793C87" } },
  { title: "level 5", state: "locked",      tint: { skyTop: "#AA3A89", skyBottom: "#982D78" } },
  { title: "level 6", state: "locked",      tint: { skyTop: "#C7337C", skyBottom: "#B61E68" } },
];

const UNIVERSE_CARD_LAYOUTS: Record<
  string,
  {
    collapsedLogo: string;
    expandedLogo: string;
    expandedLogoTop: string;
    subtitleTop: string;
  }
> = {
  "wake-the-fck-up": {
    collapsedLogo: "w-[90px] md:w-[96px]",
    expandedLogo: "group-hover:w-[92px] group-focus-visible:w-[92px] md:group-hover:w-[100px] md:group-focus-visible:w-[100px]",
    expandedLogoTop: "group-hover:top-[136px] group-focus-visible:top-[136px] md:group-hover:top-[150px] md:group-focus-visible:top-[150px]",
    subtitleTop: "top-[172px] md:top-[190px]",
  },
  "prana-fusion": {
    collapsedLogo: "w-[110px] md:w-[116px]",
    expandedLogo: "group-hover:w-[112px] group-focus-visible:w-[112px] md:group-hover:w-[118px] md:group-focus-visible:w-[118px]",
    expandedLogoTop: "group-hover:top-[136px] group-focus-visible:top-[136px] md:group-hover:top-[150px] md:group-focus-visible:top-[150px]",
    subtitleTop: "top-[170px] md:top-[188px]",
  },
  "yoga-reset": {
    collapsedLogo: "w-[178px] md:w-[196px]",
    expandedLogo: "group-hover:w-[184px] group-focus-visible:w-[184px] md:group-hover:w-[202px] md:group-focus-visible:w-[202px]",
    expandedLogoTop: "group-hover:top-[136px] group-focus-visible:top-[136px] md:group-hover:top-[150px] md:group-focus-visible:top-[150px]",
    subtitleTop: "top-[170px] md:top-[188px]",
  },
  "gravity-yoga": {
    collapsedLogo: "w-[116px] md:w-[124px]",
    expandedLogo: "group-hover:w-[118px] group-focus-visible:w-[118px] md:group-hover:w-[126px] md:group-focus-visible:w-[126px]",
    expandedLogoTop: "group-hover:top-[136px] group-focus-visible:top-[136px] md:group-hover:top-[150px] md:group-focus-visible:top-[150px]",
    subtitleTop: "top-[170px] md:top-[188px]",
  },
  "here-to-there": {
    collapsedLogo: "w-[94px] md:w-[100px]",
    expandedLogo: "group-hover:w-[96px] group-focus-visible:w-[96px] md:group-hover:w-[102px] md:group-focus-visible:w-[102px]",
    expandedLogoTop: "group-hover:top-[136px] group-focus-visible:top-[136px] md:group-hover:top-[150px] md:group-focus-visible:top-[150px]",
    subtitleTop: "top-[170px] md:top-[188px]",
  },
};

export default async function Home({ searchParams }: HomePageProps) {
  const query = await searchParams;
  const libraryMode = normalizeLibraryMode(query.mode);
  const practiceFilter = query.kind ?? "all";
  const practiceQuery = (query.q ?? "").trim().slice(0, 80);
  const practiceWorld = practiceUniverses.some((universe) => universe.slug === query.world)
    ? query.world ?? "all"
    : "all";
  const cookieStore = await cookies();
  const devAccessPreview = await getDevAccessPreview();
  const devProgressMode = devAccessPreview.enabled
    ? normalizeDevProgressMode(cookieStore.get(DEV_PROGRESS_COOKIE)?.value)
    : "real";
  const isDevProgressOverride = devProgressMode !== "real";
  const memberSession = await getYweMemberSession();
  const userId = memberSession.signedIn || devAccessPreview.signedIn
    ? "shared-ywe-member"
    : null;
  const progress = memberSession.access?.levelProgress ?? [];
  const isEntitled = Boolean(memberSession.access?.entitled) || devAccessPreview.entitled;
  const hasCompletedWelcome = Boolean(
    memberSession.profile?.welcomeCompletedAt ||
      cookieStore.get(WELCOME_COMPLETED_COOKIE)?.value === "1" ||
      devProgressMode === "all" ||
      devAccessPreview.fullAccess,
  );
  const journeyReady = Boolean(userId && hasCompletedWelcome);

  const realCompletedLevels = new Set(
    progress
      ?.filter((level) => level.status === "completed")
      .map((level) => level.level_number) ?? [],
  );
  const realInProgressLevels = new Set(
    progress
      ?.filter((level) => level.status === "in_progress")
      .map((level) => level.level_number) ?? [],
  );
  const completedLevelCount = devCompletedLevelCount(
    devProgressMode,
    realCompletedLevels.size,
  );
  const completedLevels =
    devProgressMode === "all"
      ? new Set([1, 2, 3, 4, 5, 6])
      : devProgressMode === "half"
        ? new Set([1, 2, 3])
        : realCompletedLevels;
  const inProgressLevels =
    devProgressMode === "half"
      ? new Set([4])
      : devProgressMode === "all"
        ? new Set<number>()
        : realInProgressLevels;
  const levels = LEVELS.map((level, index) => {
    const levelNumber = index + 1;
    const isAvailable =
      (journeyReady || isDevProgressOverride) &&
      levelNumber <= completedLevelCount + 1;
    const href = !isDevProgressOverride && !hasCompletedWelcome
      ? `/welcome?next=/levels/${levelNumber}`
      : !userId && !isDevProgressOverride
        ? `/login?next=/levels/${levelNumber}`
      : isAvailable || completedLevels.has(levelNumber)
        ? `/levels/${levelNumber}`
        : `/locked?type=level&required=${levelNumber - 1}&target=${levelNumber}`;

    return {
      ...level,
      state: completedLevels.has(levelNumber)
        ? "completed"
        : inProgressLevels.has(levelNumber)
          ? "in-progress"
          : isAvailable
            ? "unlocked"
            : "locked",
      href,
    } satisfies LevelSpec & { href: string };
  });
  const showWelcome = !hasCompletedWelcome;

  return (
    <ThemeProvider theme={dseTheme} className="flex-1">
      <main
        className={`${styles.homeShell} flex min-h-[100dvh] flex-col items-center px-5 py-8 md:py-12`}
        style={{ background: "var(--theme-color-surface)" }}
      >
        <div className="w-full max-w-[440px]">
          <div className="relative">
            <Header />
          </div>

          <div className={`${styles.headerRule} mt-6 h-px w-full`} />

          <div className="pt-5">
            <LibraryModeSwitcher
              activeMode={libraryMode}
              practiceFilter={practiceFilter}
              practiceQuery={practiceQuery}
              practiceWorld={practiceWorld}
              practiceWorlds={practiceUniverses}
            />
          </div>

          <div className={styles.modeStage} data-mode={libraryMode} key={libraryMode}>
          {libraryMode === "tutorial" ? (
          <div id="library-mode-panel" role="tabpanel" aria-labelledby="library-mode-0">
          <ul className="manual-home-list flex flex-col gap-[5px] pt-5 pb-8">
            {showWelcome && (
              <li
                className={`manual-home-item ${styles.welcomeItem}`}
                style={
                  {
                    "--levels-order": 0,
                    "--journey-order": 0,
                  } as CSSProperties
                }
              >
                <WelcomeButton />
              </li>
            )}
            {levels.map((level, index) => (
              <li
                key={level.title}
                className={`manual-home-item ${styles.universeItem}`}
                style={
                  {
                    "--levels-order": index + 1,
                    "--journey-order": index * 2 + 1,
                  } as CSSProperties
                }
              >
                <CloudButton {...(level as CloudButtonProps)} />
              </li>
            ))}
            {practiceUniverses.map((tutorial) => (
              <li
                key={tutorial.slug}
                className="manual-home-item"
                style={
                  {
                    "--levels-order": 100 + tutorial.unlockAfterLevel,
                    "--journey-order": tutorial.unlockAfterLevel * 2,
                  } as CSSProperties
                }
              >
                <SideTutorialCard
                  releaseStatus="available"
                  tutorial={tutorial}
                  lockReason={
                    !isEntitled
                      ? "purchase"
                      : completedLevelCount < tutorial.unlockAfterLevel
                        ? "progression"
                        : undefined
                  }
                  state={
                    !isEntitled || completedLevelCount < tutorial.unlockAfterLevel
                      ? "locked"
                      : devProgressMode === "all"
                      ? "completed"
                      : "in-progress"
                  }
                />
              </li>
            ))}
          </ul>
          </div>
          ) : (
            <HomeLibraryView
              completedLevels={[...completedLevels]}
              entitled={isEntitled}
              mode={libraryMode}
              practiceFilter={practiceFilter}
              practiceQuery={practiceQuery}
              practiceWorld={practiceWorld}
              signedIn={Boolean(userId)}
            />
          )}
          </div>
        </div>
      </main>
    </ThemeProvider>
  );
}

function WelcomeButton() {
  return (
    <Link
      href="/welcome"
      transitionTypes={["nav-forward"]}
      aria-label="Start Here — welcome introduction"
      className={`rainbow-border shape-frame group block p-[2px] ${styles.startLink}`}
    >
      <span className="shape-frame relative flex min-h-[104px] items-center justify-center overflow-hidden bg-black px-7 md:min-h-[116px]">
        <span
          className={`relative z-[1] text-[28px] font-extrabold leading-none tracking-normal text-white md:text-[32px] xl:text-[36px] ${styles.startLabel}`}
          style={{
            textShadow:
              "0 1px 2px rgba(0,0,0,0.28), 0 2px 8px rgba(12,19,45,0.32)",
          }}
        >
          Start Here
        </span>
        <span className={`absolute right-7 top-1/2 z-[2] text-white ${styles.startArrow}`}>
          <SystemIcon name="arrow-right" className="h-5 w-5" />
        </span>
      </span>
    </Link>
  );
}

function Header() {
  return (
    <header className="relative pb-1 pt-6 text-center">
      <h1 className="sr-only">The User Manual Yoga with Ethan</h1>
      <img
        src="/rainbow-arc.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 z-0 w-[250px] max-w-none -translate-x-1/2 select-none opacity-80 md:w-[292px]"
      />
      <img
        src="/um-ywe.png"
        alt="The User Manual Yoga with Ethan"
        className="relative z-10 mx-auto block w-[340px] max-w-full select-none md:w-[410px]"
      />
    </header>
  );
}

function SideTutorialCard({
  lockReason,
  releaseStatus,
  state,
  tutorial,
}: {
  lockReason?: "purchase" | "progression";
  releaseStatus: "available" | "coming_soon";
  state: "completed" | "in-progress" | "locked";
  tutorial: PracticeUniverse;
}) {
  const isLocked = state === "locked";
  const canExpand = !isLocked;
  const requiresPurchase = isLocked && lockReason === "purchase";
  const isComingSoon = releaseStatus === "coming_soon";
  const label = `${tutorial.title} — ${
    isLocked
      ? lockReason === "purchase"
        ? "locked until lifetime access is purchased"
        : `locked until level ${tutorial.unlockAfterLevel} is complete`
      : isComingSoon
        ? "coming soon"
      : state === "completed"
        ? "completed"
        : "available"
  }`;
  const tint = {
    skyTop: tutorial.color,
    skyBottom: tutorial.color,
  };
  const iconStyle = {
    "--universe-icon-url": `url("${tutorial.icon}")`,
    "--universe-icon-color": tutorial.theme.accent,
  } as CSSProperties;
  const layout =
    UNIVERSE_CARD_LAYOUTS[tutorial.slug] ??
    UNIVERSE_CARD_LAYOUTS["prana-fusion"];

  return (
    <div
      className={canExpand ? "group relative" : "relative"}
      data-ambient-paused={isLocked ? "" : undefined}
    >
      <ViewTransition name={isLocked ? `detail-locked-${tutorial.slug}` : `detail-universe-${tutorial.slug}`} share="detail-morph" default="none">
        <Link
        href={
          isLocked
            ? requiresPurchase
              ? `/paid?feature=${tutorial.slug}`
              : `/locked?type=universe&required=${tutorial.unlockAfterLevel}&target=${tutorial.slug}`
            : universeHref(tutorial.slug)
        }
        transitionTypes={["nav-forward"]}
        aria-label={label}
        data-universe={tutorial.slug}
        data-state={isComingSoon ? "coming-soon" : state}
        className={[
          "universe-card shape-journey-card relative block min-h-[104px] w-full overflow-hidden px-7 md:min-h-[116px]",
          "border border-white/20 shadow-[0_14px_30px_-18px_rgba(15,23,42,0.48)]",
          "transition-[filter,transform,min-height] duration-300 ease-out",
          isLocked
            ? "cursor-not-allowed grayscale"
            : "cursor-pointer hover:min-h-[220px] focus-visible:min-h-[220px] group-hover:scale-[1.01] active:scale-[0.99] md:hover:min-h-[244px] md:focus-visible:min-h-[244px]",
        ].join(" ")}
        style={{
          background: isLocked
            ? "linear-gradient(180deg, #BBC1C8 0%, #7A828C 100%)"
            : tutorial.color,
          color: tutorial.textColor ?? "#FFFFFF",
        }}
      >
        <span className="sr-only">{tutorial.title}</span>
        <UniverseAtmosphere paused={isLocked} slug={tutorial.slug} />
        <span
          aria-hidden
          className={[
            "universe-card__icon absolute left-1/2 top-[60px] z-[1] flex h-[40px] w-[40px] -translate-x-1/2 items-center justify-center rounded-full bg-white/92 md:top-[68px] md:h-[44px] md:w-[44px]",
            "shadow-[0_8px_20px_rgba(12,19,45,0.20),inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-white/60",
            "opacity-0 translate-y-3 scale-[0.82]",
            "transition-[opacity,transform] duration-300 ease-out",
            "group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100",
            "group-focus-visible:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-100",
          ].join(" ")}
          style={iconStyle}
        >
          <span
            className={[
              "block h-[24px] w-[24px] bg-[var(--universe-icon-color)] md:h-[26px] md:w-[26px]",
              "[mask-image:var(--universe-icon-url)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
              "[-webkit-mask-image:var(--universe-icon-url)] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]",
              isLocked ? "opacity-70" : "opacity-100",
            ].join(" ")}
          />
        </span>

        <span className={[
          "universe-card__logo absolute left-7 top-1/2 z-[2] flex max-w-[calc(100%-88px)] -translate-y-1/2 items-center justify-start",
          "transition-[left,top,transform,width,max-width] duration-300 ease-out",
          "group-hover:left-1/2 group-hover:max-w-[78%] group-hover:-translate-x-1/2 group-hover:-translate-y-1/2 group-hover:justify-center",
          "group-focus-visible:left-1/2 group-focus-visible:max-w-[78%] group-focus-visible:-translate-x-1/2 group-focus-visible:-translate-y-1/2 group-focus-visible:justify-center",
          layout.expandedLogoTop,
        ].join(" ")}>
          <img
            src={tutorial.logo}
            alt=""
            aria-hidden
            className={[
              "h-auto max-w-full object-contain object-left drop-shadow-[0_2px_6px_rgba(0,0,0,0.20)] transition-[width,opacity] duration-300 ease-out",
              layout.collapsedLogo,
              layout.expandedLogo,
              isLocked ? "opacity-62" : "opacity-100",
            ].join(" ")}
          />
        </span>
        <span
          aria-hidden
          className={[
            "universe-card__subtitle absolute left-1/2 z-[2] max-w-[84%] -translate-x-1/2 translate-y-2 rounded-full bg-white px-3.5 py-1.5 text-center",
            "text-[12px] font-bold leading-none md:text-[13px]",
            "shadow-[0_3px_9px_rgba(12,19,45,0.18)]",
            "opacity-0 transition-[opacity,transform] duration-300 ease-out",
            "group-hover:translate-y-0 group-hover:opacity-100",
            "group-focus-visible:translate-y-0 group-focus-visible:opacity-100",
            layout.subtitleTop,
          ].join(" ")}
          style={{
            color: tutorial.theme.ink,
            fontFamily: tutorial.theme.secondaryFont,
            fontWeight: 700,
          }}
        >
          {isComingSoon ? "coming soon" : tutorial.subtitle}
        </span>
        </Link>
      </ViewTransition>
      <StatusTooltip
        label={
          isLocked
            ? lockReason === "purchase"
              ? "Purchase lifetime access to unlock"
              : `Locked — finish Level ${tutorial.unlockAfterLevel}`
            : isComingSoon
              ? "Coming soon — included with lifetime access"
            : state === "completed"
              ? "Completed — tap to revisit"
              : "Available — not finished"
        }
        className="absolute right-4 top-1/2 z-[60] h-10 w-10 -translate-y-1/2 md:h-11 md:w-11"
        fontFamily={tutorial.theme.secondaryFont}
        fontWeight={700}
      >
        <StatusChip state={isComingSoon ? "in-progress" : state} tint={tint} />
      </StatusTooltip>
    </div>
  );
}

type TileIcon = "practice" | "faqs" | "downloads";

function Tile({ href, label, icon }: { href: string; label: string; icon: TileIcon }) {
  return (
    <Link
      href={href}
      transitionTypes={["nav-forward"]}
      className="shape-card group flex aspect-square flex-col items-center justify-center gap-2 border border-white/70 bg-white shadow-[0_10px_28px_rgba(12,19,45,0.08),inset_0_1px_0_rgba(255,255,255,0.88)] active:scale-[0.98] transition-transform"
    >
      <span
        aria-hidden
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F5F8FC] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_3px_9px_rgba(12,19,45,0.08)] transition-transform group-hover:scale-105"
      >
        <TileArtwork icon={icon} />
      </span>
      <span
        className="text-[13px] font-semibold text-[#1a1712]"
        style={{ fontFamily: "var(--theme-font-body)" }}
      >
        {label}
      </span>
      <span className="sr-only">Paid companion feature</span>
    </Link>
  );
}

function TileArtwork({ icon }: { icon: TileIcon }) {
  if (icon === "practice") {
    return (
      <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden>
        <defs>
          <linearGradient id="practice-red" x1="8" y1="40" x2="36" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#DA1E37" />
            <stop offset="1" stopColor="#FF6B6B" />
          </linearGradient>
          <linearGradient id="practice-teal" x1="30" y1="8" x2="42" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#58D8C3" />
            <stop offset="1" stopColor="#1B8DAB" />
          </linearGradient>
        </defs>
        <circle cx="21" cy="27" r="15" fill="url(#practice-red)" />
        <circle cx="21" cy="27" r="10" fill="#FFFFFF" />
        <circle cx="21" cy="27" r="6" fill="url(#practice-red)" />
        <circle cx="21" cy="27" r="2.6" fill="#FFFFFF" />
        <path d="M29 18l8-8 1.2 6.2L44 18l-8.1 2.3L33.7 28z" fill="url(#practice-teal)" />
        <path d="M20.5 27.5L37.8 10.2" stroke="#173C8A" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "faqs") {
    return (
      <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden>
        <defs>
          <linearGradient id="faqs-blue" x1="10" y1="38" x2="38" y2="10" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D8ECFF" />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient id="faqs-line" x1="15" y1="28" x2="34" y2="16" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2249A8" />
            <stop offset="1" stopColor="#6B7CEB" />
          </linearGradient>
        </defs>
        <path
          d="M9 23.6c0-8 6.8-14.1 15.2-14.1 8.3 0 14.8 5.8 14.8 13.5 0 7.8-6.6 13.7-15.2 13.7-1.6 0-3.2-.2-4.7-.7l-7 3.1 1.8-6.1A13 13 0 0 1 9 23.6z"
          fill="url(#faqs-blue)"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <path
          d="M20 20.5c.3-2.7 2.1-4.4 4.8-4.4 2.8 0 4.9 1.8 4.9 4.3 0 2.2-1.3 3.4-3 4.4-1.5.9-2.2 1.6-2.2 3.3"
          fill="none"
          stroke="url(#faqs-line)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24.5" cy="33" r="1.8" fill="#2249A8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden>
      <defs>
        <linearGradient id="downloads-folder" x1="10" y1="37" x2="39" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8593A3" />
          <stop offset="1" stopColor="#E7EEF6" />
        </linearGradient>
        <linearGradient id="downloads-arrow" x1="24" y1="16" x2="24" y2="33" gradientUnits="userSpaceOnUse">
          <stop stopColor="#173C8A" />
          <stop offset="1" stopColor="#4C7AE4" />
        </linearGradient>
      </defs>
      <path
        d="M7.5 17.5c0-2.2 1.8-4 4-4H20l3.8 3.8h12.7c2.2 0 4 1.8 4 4v2.2h-33v-6z"
        fill="#DCE6F0"
      />
      <path
        d="M8.5 20.5h31.8c1.7 0 3 1.5 2.7 3.2L40.8 35c-.4 2-2.1 3.5-4.2 3.5H11.4c-2.1 0-3.8-1.5-4.2-3.5L5.8 24c-.2-1.8 1.1-3.5 2.7-3.5z"
        fill="url(#downloads-folder)"
      />
      <path d="M24 17.5v13" stroke="url(#downloads-arrow)" strokeWidth="3" strokeLinecap="round" />
      <path d="M18.8 26.2L24 31.4l5.2-5.2" fill="none" stroke="#173C8A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
