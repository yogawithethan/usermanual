"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import type { TutorialSection } from "@islands/content";

interface TutorialRailProps {
  sections: TutorialSection[];
}

type RailAction = "top" | "video" | "faq" | "audio" | "complete";

export function TutorialRail({ sections }: TutorialRailProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const sectionElements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0.08, 0.2, 0.4],
      },
    );

    sectionElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  const actions = useMemo(
    () => [
      { type: "top" as const, label: "Back to top", target: "top" },
      { type: "video" as const, label: "Jump to video", target: "video" },
    ],
    [],
  );

  return (
    <nav
      aria-label="Lesson navigation"
      className="fixed right-2 top-1/2 z-50 -translate-y-1/2 md:right-4"
    >
      <div className="flex w-[36px] flex-col items-center gap-2 rounded-full bg-white/92 px-1 py-2 shadow-[0_12px_30px_rgba(12,19,45,0.16)] ring-1 ring-black/5 backdrop-blur-md">
        <div className="flex flex-col items-center gap-1">
          {actions.map((action) => (
            <RailButton
              key={action.type}
              label={action.label}
              onClick={() => scrollToTarget(action.target)}
            >
              <RailIcon type={action.type} />
            </RailButton>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2">
          {sections.map((section) => (
            <RailDot
              key={section.id}
              active={activeId === section.id}
              label={section.title}
              onClick={() => scrollToTarget(section.id)}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-1">
          <RailButton label="Frequently asked questions" onClick={() => scrollToTarget("faq")}>
            <RailIcon type="faq" />
          </RailButton>
          <RailButton label="Practice audio" onClick={() => scrollToTarget("practice-audio")}>
            <RailIcon type="audio" />
          </RailButton>
          <RailButton label="Complete level" onClick={() => scrollToTarget("complete-level")}>
            <RailIcon type="complete" />
          </RailButton>
        </div>
      </div>
    </nav>
  );
}

function scrollToTarget(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function RailButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rail-item group relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-[#73777E] transition-colors hover:bg-[#E9F2FF] hover:text-[#1E68B6] focus-visible:bg-[#E9F2FF] focus-visible:text-[#1E68B6] focus-visible:outline-none"
    >
      <RailTooltip>{label}</RailTooltip>
      {children}
    </button>
  );
}

function RailDot({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rail-item group relative flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full focus-visible:outline-none"
    >
      <RailTooltip>{label}</RailTooltip>
      <span
        className={[
          "block rounded-full transition-all",
          active
            ? "h-3 w-3 bg-[#1E68B6] shadow-[0_0_0_3px_rgba(30,104,182,0.12)]"
            : "h-2 w-2 bg-[#D6D9DE] group-hover:bg-[#B8C0CA]",
        ].join(" ")}
      />
    </button>
  );
}

function RailTooltip({ children }: { children: ReactNode }) {
  return (
    <span
      role="tooltip"
      className={[
        "pointer-events-none absolute right-[calc(100%+10px)] top-1/2 z-[999]",
        "-translate-y-1/2 translate-x-1 whitespace-nowrap rounded-[8px] bg-[#1E68B6] px-3 py-1.5",
        "text-[13px] font-semibold tracking-tight text-white opacity-0 shadow-[0_10px_24px_rgba(12,19,45,0.22)]",
        "transition-[opacity,transform] duration-200 ease-out",
        "after:absolute after:left-full after:top-1/2 after:h-0 after:w-0 after:-translate-y-1/2 after:border-y-[7px] after:border-l-[8px] after:border-y-transparent after:border-l-[#1E68B6]",
        "group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
      ].join(" ")}
      style={{ fontFamily: "var(--font-dse-label)" }}
    >
      {children}
    </span>
  );
}

function RailIcon({ type }: { type: RailAction | "faq" }) {
  if (type === "top") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 19V5" />
        <path d="M6 11l6-6 6 6" />
      </svg>
    );
  }

  if (type === "video") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
        <rect x="4" y="6.5" width="16" height="11" rx="2" />
        <path d="M10 10l5 2-5 2z" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (type === "audio") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="M5 14v-4" />
        <path d="M9 17V7" />
        <path d="M13 20V4" />
        <path d="M17 17V7" />
        <path d="M21 14v-4" />
      </svg>
    );
  }

  if (type === "complete") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" />
        <path d="M5 6H3a4 4 0 0 0 4 4" />
        <path d="M19 6h2a4 4 0 0 1-4 4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9.2 9a3 3 0 1 1 4.9 2.3c-1.2.9-2.1 1.6-2.1 3.2" />
      <path d="M12 19h.01" />
    </svg>
  );
}
