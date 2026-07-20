"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  BookOpenText,
  CaretRight,
  Check,
  Clock,
  DownloadSimple,
  Headphones,
  LockKey,
  Play,
  Sparkle,
  Waveform,
} from "@phosphor-icons/react";
import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type {
  PracticeUniverse,
  UniverseDownload,
  UniversePractice,
  UniverseTutorialContent,
} from "@islands/content";

import { AuthMenu } from "@/components/auth/AuthMenu";
import { ProgressActivityBeacon } from "@/components/progress/ProgressActivityBeacon";
import { PurchaseDisclosure } from "@/components/purchase/PurchaseDisclosure";
import { MarkdownContent } from "@/components/tutorials/MarkdownContent";
import { renderMarkdownInline } from "@/components/tutorials/MarkdownInline";
import { CompletionBadge } from "@/components/ui/CompletionBadge";

import styles from "./WorldExperience.module.css";

export const WORLD_MODES = ["tutorial", "practice", "faqs", "downloads"] as const;
export type WorldMode = (typeof WORLD_MODES)[number];
export type WorldAccessState =
  | "account-required"
  | "progression-locked"
  | "payment-locked"
  | "purchased-progression-locked"
  | "available"
  | "in-progress"
  | "completed";

export interface WorldFilterState {
  body?: string;
  duration?: string;
  goal?: string;
  intensity?: string;
  kind?: string;
}

interface WorldExperienceProps {
  accessState: WorldAccessState;
  completedLevelCount: number;
  filters: WorldFilterState;
  member?: { displayName?: string; email?: string };
  mode: WorldMode;
  practices: UniversePractice[];
  tutorial: UniverseTutorialContent;
  universe: PracticeUniverse;
  downloads: UniverseDownload[];
}

const MODE_LABELS: Record<WorldMode, string> = {
  tutorial: "Tutorial",
  practice: "Practice",
  faqs: "FAQs",
  downloads: "Downloads",
};

const KIND_LABELS: Record<string, string> = {
  all: "All",
  audio: "Audio",
  breathwork: "Breathwork",
  flexibility: "Flexibility",
  "hatha-yoga": "Hatha yoga",
  meditation: "Meditation",
};

function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function worldStyle(universe: PracticeUniverse) {
  return {
    "--world-accent": universe.theme.accent,
    "--world-surface": universe.theme.surface,
    "--world-ink": universe.theme.ink,
    "--world-on-accent": universe.theme.onAccent ?? "#ffffff",
    "--world-primary": universe.theme.primaryFont,
    "--world-secondary": universe.theme.secondaryFont,
    "--world-heading-weight": universe.theme.headingFontWeight ?? 700,
    "--world-heading-spacing": universe.theme.headingLetterSpacing ?? "-.035em",
  } as CSSProperties;
}

export function WorldExperience({
  accessState,
  completedLevelCount,
  downloads,
  filters: initialFilters,
  member,
  mode: initialMode,
  practices,
  tutorial,
  universe,
}: WorldExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mode, setMode] = useState<WorldMode>(initialMode);
  const [filters, setFilters] = useState<WorldFilterState>(initialFilters);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const isContentAvailable = ["available", "in-progress", "completed"].includes(accessState);
  const activeIndex = WORLD_MODES.indexOf(mode);

  function replaceUrl(nextMode: WorldMode, nextFilters: WorldFilterState) {
    const params = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
    if (nextMode === "tutorial") params.delete("mode");
    else params.set("mode", nextMode);
    for (const key of ["kind", "goal", "body", "intensity", "duration"] as const) {
      const value = nextFilters[key];
      if (nextMode === "practice" && value && value !== "all") params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function selectMode(nextMode: WorldMode) {
    setMode(nextMode);
    replaceUrl(nextMode, filters);
  }

  function updateFilter(key: keyof WorldFilterState, value: string) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    replaceUrl("practice", next);
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home"
      ? 0
      : event.key === "End"
        ? WORLD_MODES.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + WORLD_MODES.length) % WORLD_MODES.length;
    selectMode(WORLD_MODES[next]);
    tabRefs.current[next]?.focus();
  }

  return (
    <main className={styles.page} style={worldStyle(universe)}>
      {isContentAvailable ? <ProgressActivityBeacon id={universe.slug} kind="tutorial" /> : null}
      <WorldHeader
        completedLevelCount={completedLevelCount}
        member={member}
        universe={universe}
      />
      <WorldHero accessState={accessState} universe={universe} />

      <nav className={styles.modeBar} aria-label={`${universe.title} sections`}>
        <div className={styles.tabs} role="tablist" style={{ "--active-index": activeIndex } as CSSProperties}>
          <span className={styles.activePill} aria-hidden />
          {WORLD_MODES.map((item, index) => (
            <button
              key={item}
              ref={(node) => { tabRefs.current[index] = node; }}
              type="button"
              className={styles.tab}
              role="tab"
              aria-selected={mode === item}
              aria-controls="world-mode-panel"
              tabIndex={mode === item ? 0 : -1}
              onClick={() => selectMode(item)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
            >
              {MODE_LABELS[item]}
            </button>
          ))}
        </div>
      </nav>

      <section id="world-mode-panel" className={styles.content} role="tabpanel">
        {mode === "faqs" ? (
          <FaqMode
            accessState={accessState}
            faqs={tutorial.faqs}
            universe={universe}
          />
        ) : !isContentAvailable ? (
          <AccessGate accessState={accessState} mode={mode} onShowFaqs={() => selectMode("faqs")} universe={universe} />
        ) : mode === "tutorial" ? (
          <TutorialMode
            accessState={accessState}
            tutorial={tutorial}
            universe={universe}
          />
        ) : mode === "practice" ? (
          <PracticeMode
            filters={filters}
            onFilter={updateFilter}
            practices={practices}
            universe={universe}
          />
        ) : (
          <DownloadsMode downloads={downloads} universe={universe} />
        )}
      </section>
    </main>
  );
}

function WorldHeader({
  completedLevelCount,
  member,
  universe,
}: {
  completedLevelCount: number;
  member?: { displayName?: string; email?: string };
  universe: PracticeUniverse;
}) {
  return (
    <header className={styles.header}>
      <Link className={styles.back} href="/" transitionTypes={["nav-back"]} aria-label="Back to roadmap">
        <ArrowLeft size={18} weight="bold" aria-hidden />
      </Link>
      <span className={styles.progress}>
        <span className={styles.progressDot}><Sparkle size={15} weight="fill" aria-hidden /></span>
        <span className={styles.progressText}>Level {universe.unlockAfterLevel} world</span>
        <span>{completedLevelCount}/6</span>
      </span>
      <span className={styles.accountSlot}>
        <AuthMenu
          completedLevelCount={completedLevelCount}
          displayName={member?.displayName}
          email={member?.email}
          next={`/universes/${universe.slug}`}
        />
      </span>
    </header>
  );
}

export function WorldHero({ accessState, universe }: { accessState: WorldAccessState; universe: PracticeUniverse }) {
  const progressionReady = !["progression-locked", "purchased-progression-locked", "account-required"].includes(accessState);
  const paid = ["available", "in-progress", "completed", "purchased-progression-locked"].includes(accessState);
  return (
    <section className={styles.hero} aria-labelledby="world-title">
      <span className={styles.orb} aria-hidden />
      <span className={styles.orb} aria-hidden />
      <div className={styles.heroInner}>
        <span className={styles.heroIcon} aria-hidden>
          <span
            className={styles.heroIconMask}
            style={{ mask: `url('${universe.icon}') center / contain no-repeat`, WebkitMask: `url('${universe.icon}') center / contain no-repeat` }}
          />
        </span>
        <span
          className={styles.logo}
          style={{ mask: `url('${universe.logo}') center / contain no-repeat`, WebkitMask: `url('${universe.logo}') center / contain no-repeat` }}
          aria-hidden
        />
        <h1 id="world-title" className="sr-only">{universe.title}</h1>
        <p className={styles.subtitle}>{universe.subtitle}</p>
        <div className={styles.gateLine} aria-label="Access summary">
          <span className={`${styles.gateChip} ${progressionReady ? styles.gateChipReady : ""}`}>
            {progressionReady ? <Check size={12} weight="bold" aria-hidden /> : <LockKey size={12} aria-hidden />} Level {universe.unlockAfterLevel}
          </span>
          <span className={`${styles.gateChip} ${paid ? styles.gateChipReady : ""}`}>
            {paid ? <Check size={12} weight="bold" aria-hidden /> : <LockKey size={12} aria-hidden />} Lifetime access
          </span>
        </div>
      </div>
    </section>
  );
}

function TutorialMode({ accessState, tutorial, universe }: { accessState: WorldAccessState; tutorial: UniverseTutorialContent; universe: PracticeUniverse }) {
  return (
    <div className={styles.contentGrid}>
      <nav className={styles.contentsRail} aria-label="Tutorial contents">
        <p>Contents</p>
        {tutorial.sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}
      </nav>
      <article className={styles.article}>
        <header className={styles.articleIntro}>
          <p className={styles.eyebrow}>{tutorial.sourceTitle} · {tutorial.sections.length} chapters</p>
          <h2 className={styles.articleTitle}>Start here.</h2>
          <p className={styles.articleLead}>Read at your own pace. Media is being added separately, and completing this tutorial is always your deliberate choice.</p>
        </header>
        {tutorial.sections.map((section) => (
          <section className={styles.chapter} id={section.id} key={section.id}>
            <h2>{section.title}</h2>
            <div className={styles.prose}>
              <MarkdownContent blocks={section.paragraphs} blockClassName="" />
            </div>
          </section>
        ))}
        <TutorialCompletionControl complete={accessState === "completed"} universe={universe} />
      </article>
    </div>
  );
}

function TutorialCompletionControl({ complete: initiallyComplete, universe }: { complete: boolean; universe: PracticeUniverse }) {
  const [complete, setComplete] = useState(initiallyComplete);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(false);
  const [error, setError] = useState("");

  async function markComplete() {
    if (complete || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/progress/practices", {
        body: JSON.stringify({ practiceId: universe.slug, status: "completed" }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(result.error ?? "Progress could not be saved.");
      }
      setComplete(true);
      document.dispatchEvent(new CustomEvent("ywe:tutorial-progress-changed", {
        detail: { kind: "tutorial", practiceId: universe.slug, status: "completed" },
      }));
      setNotice(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Progress could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={styles.completePanel}>
        <span>
          <strong>{complete ? "Tutorial complete" : "Finished this tutorial?"}</strong>
          <small>No video or checklist requirement. Press the badge whenever you decide you are complete.</small>
          {error ? <span className={styles.saveError} role="alert">{error}</span> : null}
        </span>
        <CompletionBadge complete={complete} disabled={saving || complete} onClick={markComplete} />
      </div>
      {notice ? (
        <div className={styles.completionDialog} role="dialog" aria-modal="true" aria-labelledby="tutorial-complete-title">
          <section className={styles.completionCard}>
            <span className={styles.completionMark} aria-hidden><Check size={25} weight="bold" /></span>
            <h2 id="tutorial-complete-title">{universe.title} complete.</h2>
            <p>Your practice collection is the next place to explore. Anything without finished media is clearly marked Coming soon.</p>
            <button className={styles.primaryButton} type="button" onClick={() => setNotice(false)}>See what’s next</button>
          </section>
        </div>
      ) : null}
    </>
  );
}

function PracticeMode({
  filters,
  onFilter,
  practices,
  universe,
}: {
  filters: WorldFilterState;
  onFilter: (key: keyof WorldFilterState, value: string) => void;
  practices: UniversePractice[];
  universe: PracticeUniverse;
}) {
  const kinds = ["all", "audio", "breathwork", "flexibility", "hatha-yoga", "meditation"];
  const goals = unique(practices.map((item) => item.goal));
  const bodies = unique(practices.map((item) => item.bodyArea));
  const intensities = unique(practices.map((item) => item.intensity));
  const selectedKind = filters.kind ?? "all";
  const visible = useMemo(() => practices.filter((item) => {
    const duration = filters.duration;
    return (selectedKind === "all" || item.kind === selectedKind)
      && (!filters.goal || filters.goal === "all" || item.goal === filters.goal)
      && (!filters.body || filters.body === "all" || item.bodyArea === filters.body)
      && (!filters.intensity || filters.intensity === "all" || item.intensity === filters.intensity)
      && (!duration || duration === "all" || (duration === "short" ? item.durationMinutes <= 15 : duration === "medium" ? item.durationMinutes > 15 && item.durationMinutes <= 25 : item.durationMinutes > 25));
  }), [filters, practices, selectedKind]);

  return (
    <div>
      <header className={styles.sectionHeader}>
        <div><h2>Practice</h2><p>Choose by format, goal, body area, intensity, or duration. Your filters stay in the URL when you share or return.</p></div>
      </header>
      <section className={styles.filterShell} aria-label="Practice filters">
        <div className={styles.filterRail}>
          {kinds.map((kind) => (
            <button key={kind} type="button" className={styles.filterChip} aria-pressed={selectedKind === kind} onClick={() => onFilter("kind", kind)}>
              {KIND_LABELS[kind]}
            </button>
          ))}
        </div>
        <div className={styles.filterOptions}>
          <FilterSelect label="Goal" value={filters.goal} options={goals} onChange={(value) => onFilter("goal", value)} />
          <FilterSelect label="Body area" value={filters.body} options={bodies} onChange={(value) => onFilter("body", value)} />
          <FilterSelect label="Intensity" value={filters.intensity} options={intensities} onChange={(value) => onFilter("intensity", value)} />
          <FilterSelect label="Duration" value={filters.duration} options={["short", "medium", "long"]} onChange={(value) => onFilter("duration", value)} />
        </div>
        <p className={styles.resultCount}>{visible.length} {visible.length === 1 ? "practice" : "practices"}</p>
      </section>
      <div className={styles.cards}>
        {visible.map((item) => (
          <Link className={styles.practiceCard} href={`/universes/${universe.slug}/practices/${item.id}?from=practice`} key={item.id}>
            <span className={styles.thumb} aria-hidden>{item.kind === "audio" ? <Headphones size={28} /> : item.kind === "breathwork" ? <Waveform size={28} /> : <Play size={27} />}</span>
            <span>
              <span className={styles.practiceMeta}><span>{item.kind.replace("-", " ")}</span><span>·</span><span>{item.durationMinutes} min</span><span>·</span><span>Coming soon</span></span>
              <h3 className={styles.practiceTitle}>{item.title}</h3>
              <p className={styles.practiceCopy}>{item.description}</p>
            </span>
            <span className={styles.cardAction} aria-hidden><Bell size={17} /></span>
          </Link>
        ))}
      </div>
      {!visible.length ? <EmptyMode title="Nothing matches yet" copy="Try clearing one or more filters. New practices will appear here as they are prepared." /> : null}
    </div>
  );
}

function FilterSelect({ label, onChange, options, value }: { label: string; onChange: (value: string) => void; options: string[]; value?: string }) {
  return (
    <label className={styles.filterLabel}>
      {label}
      <select className={styles.select} value={value ?? "all"} onChange={(event) => onChange(event.target.value)}>
        <option value="all">All</option>
        {options.map((option) => <option value={option} key={option}>{option.replace("-", " ")}</option>)}
      </select>
    </label>
  );
}

function FaqMode({ accessState, faqs, universe }: { accessState: WorldAccessState; faqs: UniverseTutorialContent["faqs"]; universe: PracticeUniverse }) {
  const entitled = ["available", "in-progress", "completed", "purchased-progression-locked"].includes(accessState);
  return (
    <div>
      <header className={styles.sectionHeader}>
        <div><h2>FAQs</h2><p>Prepared answers are free to read. Community comments and asking Ethan a new question are part of lifetime access.</p></div>
      </header>
      {faqs.length ? (
        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <details className={styles.faq} key={faq.question} open={index === 0}>
              <summary>{renderMarkdownInline(faq.question, [], `world-faq-question-${index}`)}</summary>
              <p>{renderMarkdownInline(faq.answer, [], `world-faq-answer-${index}`)}</p>
            </details>
          ))}
        </div>
      ) : (
        <EmptyMode title="Prepared answers are on the way" copy="This tutorial does not have a reviewed FAQ set yet. The written tutorial remains available in its current release state." />
      )}
      <section className={styles.questionCard}>
        <span><strong>Have a different question?</strong><span>Ask Ethan and join the paid community conversation.</span></span>
        <Link className={entitled ? styles.primaryButton : styles.secondaryButton} href={entitled ? `/levels/${universe.unlockAfterLevel}#comments` : `/paid?feature=questions`}>{entitled ? "Ask Ethan" : "Included with lifetime access"}</Link>
      </section>
    </div>
  );
}

function DownloadsMode({ downloads, universe }: { downloads: UniverseDownload[]; universe: PracticeUniverse }) {
  return (
    <div>
      <header className={styles.sectionHeader}>
        <div><h2>Downloads</h2><p>Files show their format, revision, access, and release status before you open them.</p></div>
      </header>
      <div className={styles.cards}>
        {downloads.map((item) => (
          <article className={styles.downloadCard} key={item.id}>
            <span className={styles.downloadIcon} aria-hidden><DownloadSimple size={21} /></span>
            <span><h3>{item.title}</h3><p>{item.fileType} · {item.sizeLabel} · {item.revision}</p></span>
            <span className={styles.gateChip}>Coming soon</span>
          </article>
        ))}
      </div>
      <section className={styles.questionCard}>
        <span><strong>Included when released</strong><span>Your lifetime ownership covers these files and future User Manual additions included in this offer.</span></span>
        <Link className={styles.secondaryButton} href={`/universes/${universe.slug}?mode=practice`}>Explore practices</Link>
      </section>
    </div>
  );
}

function AccessGate({
  accessState,
  mode,
  onShowFaqs,
  universe,
}: {
  accessState: WorldAccessState;
  mode: WorldMode;
  onShowFaqs?: () => void;
  universe: PracticeUniverse;
}) {
  const copy = accessState === "account-required"
    ? { title: "Sign in to continue", body: "This uses your shared Yoga With Ethan account—there is no separate User Manual login.", action: "Sign in", href: `/login?next=${encodeURIComponent(`/universes/${universe.slug}?mode=${mode}`)}` }
    : accessState === "purchased-progression-locked"
      ? { title: `Complete Level ${universe.unlockAfterLevel} first`, body: "Your lifetime ownership is secure. Progression still happens in order, so the written tutorial opens when its Deeper. Slower. Easier. level is complete.", action: `Open Level ${universe.unlockAfterLevel}`, href: `/levels/${universe.unlockAfterLevel}` }
      : accessState === "payment-locked"
        ? { title: "This is part of lifetime access", body: "You have completed the progression requirement. One $144 purchase opens the paid tutorials, practices, downloads, comments, questions, and future additions in this offer.", action: "See lifetime access", href: `/paid?feature=${universe.slug}` }
        : { title: "Two gates remain", body: `Complete Level ${universe.unlockAfterLevel} to make this world progression-eligible. You may purchase lifetime access now or later; buying never skips the free sequence.`, action: `Open Level ${universe.unlockAfterLevel}`, href: `/levels/${universe.unlockAfterLevel}` };
  const showPurchase = accessState === "payment-locked" || accessState === "progression-locked";
  return (
    <section className={styles.gate}>
      <span className={styles.gateIcon} aria-hidden>{accessState === "account-required" ? <BookOpenText size={25} /> : <LockKey size={25} />}</span>
      <h2>{copy.title}</h2>
      <p>{copy.body}</p>
      <div className={styles.gateActions}>
        <Link className={styles.primaryButton} href={copy.href}>{copy.action}</Link>
        {onShowFaqs ? (
          <button className={styles.secondaryButton} type="button" onClick={onShowFaqs}>Read free FAQs</button>
        ) : (
          <Link className={styles.secondaryButton} href={`/universes/${universe.slug}?mode=faqs`}>Read free FAQs</Link>
        )}
      </div>
      {showPurchase ? <PurchaseDisclosure className={styles.purchase} primaryHref={`/paid?feature=${universe.slug}`} /> : null}
    </section>
  );
}

function EmptyMode({ copy, title }: { copy: string; title: string }) {
  return (
    <section className={styles.gate}>
      <span className={styles.gateIcon} aria-hidden><Sparkle size={25} /></span>
      <h2>{title}</h2>
      <p>{copy}</p>
    </section>
  );
}

export function PracticeDetailView({
  accessState,
  completedLevelCount,
  member,
  practice,
  universe,
}: {
  accessState: WorldAccessState;
  completedLevelCount: number;
  member?: { displayName?: string; email?: string };
  practice: UniversePractice;
  universe: PracticeUniverse;
}) {
  const accessible = ["available", "in-progress", "completed"].includes(accessState);
  return (
    <main className={styles.page} style={worldStyle(universe)}>
      <WorldHeader completedLevelCount={completedLevelCount} member={member} universe={universe} />
      <div className={styles.playerShell}>
        <div className={styles.playerTop}>
          <Link className={styles.playerBack} href={`/universes/${universe.slug}?mode=practice`} transitionTypes={["nav-back"]}><ArrowLeft size={16} weight="bold" /> Back to {universe.title}</Link>
          <span className={styles.gateChip}>Coming soon</span>
        </div>
        {!accessible ? (
          <AccessGate accessState={accessState} mode="practice" universe={universe} />
        ) : (
          <article className={styles.playerCard}>
            <section className={styles.playerStage}>
              <div className={styles.comingSoon}>
                <span className={styles.comingSoonIcon} aria-hidden>{practice.kind === "audio" ? <Headphones size={28} /> : <Play size={28} />}</span>
                <strong>Media coming soon.</strong>
                <p>The practice page is ready. The protected audio or video will appear here as soon as the final asset is released.</p>
                <ReleaseNotificationButton slug={universe.slug} />
              </div>
            </section>
            <section className={styles.playerInfo}>
              <div>
                <p className={styles.eyebrow}>{practice.kind.replace("-", " ")} · {practice.durationMinutes} minutes</p>
                <h1>{practice.title}</h1>
                <p>{practice.description}</p>
                <div className={styles.playerMeta}><span>{practice.goal}</span><span>{practice.bodyArea}</span><span>{practice.intensity}</span></div>
              </div>
              <span className={styles.downloadIcon} aria-hidden><Clock size={22} /></span>
            </section>
          </article>
        )}
      </div>
    </main>
  );
}

function ReleaseNotificationButton({ slug }: { slug: string }) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function register() {
    if (state === "saving" || state === "saved") return;
    setState("saving");
    const response = await fetch("/api/release-interest/user-manual", {
      body: JSON.stringify({ tutorialSlug: slug, emailEnabled: true, telegramEnabled: false }),
      headers: { "content-type": "application/json" },
      method: "PATCH",
    }).catch(() => null);
    setState(response?.ok ? "saved" : "error");
  }

  return (
    <button className={styles.primaryButton} type="button" onClick={register} disabled={state === "saving" || state === "saved"}>
      {state === "saved" ? <Check size={16} /> : <Bell size={16} />}
      {state === "saving" ? "Saving…" : state === "saved" ? "You’ll be notified" : state === "error" ? "Try again" : "Notify me"}
    </button>
  );
}
