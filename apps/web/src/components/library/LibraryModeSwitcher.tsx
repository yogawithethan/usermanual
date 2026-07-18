"use client";

import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

import styles from "./LibraryModeSwitcher.module.css";
import { FloatingTooltip } from "@/components/ui/FloatingTooltip";

export const LIBRARY_MODES = ["tutorial", "practice", "faqs", "downloads"] as const;
export type LibraryMode = (typeof LIBRARY_MODES)[number];

const MODE_LABELS: Record<LibraryMode, string> = {
  tutorial: "Tutorial",
  practice: "Practice",
  faqs: "FAQs",
  downloads: "Downloads",
};

const PRACTICE_FILTERS = ["all", "audio", "breathwork", "flexibility", "hatha-yoga", "meditation"] as const;

const FILTER_LABELS: Record<(typeof PRACTICE_FILTERS)[number], string> = {
  all: "All",
  audio: "Audio",
  breathwork: "Breathwork",
  flexibility: "Flexibility",
  "hatha-yoga": "Hatha yoga",
  meditation: "Meditation",
};

const WORLD_LABELS: Record<string, string> = {
  "deeper-slower-easier": "Deeper, Slower, Easier",
  "wake-the-fck-up": "Wake the F*ck Up",
  "prana-fusion": "Prāna Fusion",
  "yoga-reset": "Yoga Reset",
  "gravity-yoga": "Gravity Yoga",
  "here-to-there": "Here to There",
};

interface LibraryModeSwitcherProps {
  activeMode?: LibraryMode;
  panelId?: string;
  practiceFilter?: string;
  practiceQuery?: string;
  practiceWorld?: string;
  practiceWorlds?: { icon: string; slug: string; title: string }[];
}

export function LibraryModeSwitcher({
  activeMode,
  panelId = "library-mode-panel",
  practiceFilter = "all",
  practiceQuery = "",
  practiceWorld = "all",
  practiceWorlds = [],
}: LibraryModeSwitcherProps) {
  const [mode, setMode] = useState<LibraryMode>(activeMode ?? "tutorial");
  const [filter, setFilter] = useState(practiceFilter);
  const [searchOpen, setSearchOpen] = useState(Boolean(practiceQuery));
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isControlled = activeMode !== undefined;
  const activeIndex = LIBRARY_MODES.indexOf(mode);

  useEffect(() => {
    if (activeMode) setMode(activeMode);
  }, [activeMode]);

  useEffect(() => setFilter(practiceFilter), [practiceFilter]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  function selectMode(nextMode: LibraryMode) {
    if (!isControlled) setMode(nextMode);
  }

  function selectFilter(nextFilter: string) {
    if (!isControlled) setFilter(nextFilter);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement | HTMLAnchorElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? LIBRARY_MODES.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + LIBRARY_MODES.length) % LIBRARY_MODES.length;
    if (!isControlled) selectMode(LIBRARY_MODES[nextIndex]);
    document.getElementById(`library-mode-${nextIndex}`)?.focus();
  }

  return (
    <section
      className={styles.root}
      data-library-mode={mode}
      style={{ "--active-mode": activeIndex } as CSSProperties}
      aria-label="User Manual library"
    >
      <div className={styles.tabs} role="tablist" aria-label="Library sections">
        <span className={styles.activePill} aria-hidden />
        {LIBRARY_MODES.map((item, index) => {
          const isActive = mode === item;
          return isControlled ? (
            <Link
              id={`library-mode-${index}`}
              key={item}
              role="tab"
              aria-controls={panelId}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className={styles.tab}
              href={item === "tutorial" ? "/" : `/?mode=${item}`}
              replace
              scroll={false}
              transitionTypes={["library-mode"]}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              {MODE_LABELS[item]}
            </Link>
          ) : (
            <button
              id={`library-mode-${index}`}
              key={item}
              type="button"
              role="tab"
              aria-controls={panelId}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className={styles.tab}
              onClick={() => selectMode(item)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              {MODE_LABELS[item]}
            </button>
          );
        })}
      </div>

      {mode === "practice" ? (
        <div className={styles.practiceControls}>
          <div className={styles.railViewport}>
            <div className={styles.filters} aria-label="Practice categories">
              <form
                action="/"
                className={styles.search}
                data-open={searchOpen || undefined}
                method="get"
                role="search"
              >
                <input name="mode" type="hidden" value="practice" />
                {filter !== "all" ? <input name="kind" type="hidden" value={filter} /> : null}
                {practiceWorld !== "all" ? <input name="world" type="hidden" value={practiceWorld} /> : null}
                <button
                  aria-expanded={searchOpen}
                  aria-label={searchOpen ? "Search practices" : "Open practice search"}
                  onClick={(event) => {
                    if (searchOpen) event.currentTarget.form?.requestSubmit();
                    else setSearchOpen(true);
                  }}
                  type="button"
                >
                  <MagnifyingGlass aria-hidden size={17} weight="regular" />
                </button>
                <input
                  aria-label="Search practices"
                  defaultValue={practiceQuery}
                  name="q"
                  onKeyDown={(event) => {
                    if (event.key === "Escape" && !event.currentTarget.value) {
                      setSearchOpen(false);
                    }
                  }}
                  placeholder="Search practices"
                  ref={searchInputRef}
                  tabIndex={searchOpen ? 0 : -1}
                  type="search"
                />
              </form>
              {PRACTICE_FILTERS.map((item) =>
                isControlled ? (
                  <Link
                    key={item}
                    href={practiceHref({ kind: item, query: practiceQuery, world: practiceWorld })}
                    replace
                    scroll={false}
                    className={styles.filter}
                    aria-current={filter === item ? "page" : undefined}
                  >
                    {FILTER_LABELS[item]}
                  </Link>
                ) : (
                  <button
                    key={item}
                    type="button"
                    className={styles.filter}
                    aria-pressed={filter === item}
                    onClick={() => selectFilter(item)}
                  >
                    {FILTER_LABELS[item]}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className={styles.railViewport}>
            <div className={styles.worldFilters} aria-label="Practice worlds">
              <Link
                aria-label="All practice worlds"
                aria-current={practiceWorld === "all" ? "page" : undefined}
                className={styles.worldFilter}
                href={practiceHref({ kind: filter, query: practiceQuery, world: "all" })}
                replace
                scroll={false}
                title="All practice worlds"
              >
                <span>All</span>
              </Link>
              {[
                {
                  icon: "/tutorial-icons/dse-cloud-icon.svg",
                  slug: "deeper-slower-easier",
                  title: "Deeper, Slower, Easier",
                },
                ...practiceWorlds,
              ].map((universe) => {
                const label = WORLD_LABELS[universe.slug] ?? universe.title;
                return (
                  <FloatingTooltip className={styles.worldTooltipAnchor} key={universe.slug} label={label}>
                    <Link
                      aria-label={label}
                      aria-current={practiceWorld === universe.slug ? "page" : undefined}
                      className={styles.worldFilter}
                      href={practiceHref({ kind: filter, query: practiceQuery, world: universe.slug })}
                      replace
                      scroll={false}
                    >
                      <img alt="" aria-hidden src={universe.icon} />
                    </Link>
                  </FloatingTooltip>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function practiceHref({ kind, query, world }: { kind: string; query: string; world: string }) {
  const params = new URLSearchParams({ mode: "practice" });
  if (kind !== "all") params.set("kind", kind);
  if (world !== "all") params.set("world", world);
  if (query.trim()) params.set("q", query.trim());
  return `/?${params.toString()}`;
}
