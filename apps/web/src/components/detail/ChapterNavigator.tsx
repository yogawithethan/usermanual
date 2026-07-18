"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import type { DetailChapter } from "./DetailExperience";
import { detailStyles as styles } from "./DetailExperience";

export function ChapterNavigator({ chapters }: { chapters: DetailChapter[] }) {
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);
  const mobileRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => {
      frame.current = 0;
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setProgress(Math.max(0, Math.min(100, (window.scrollY / scrollable) * 100)));
      const activationLine = Math.min(270, window.innerHeight * 0.35);
      let next = chapters[0]?.id ?? "";
      chapters.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= activationLine) next = id;
      });
      setActiveId(next);
    };
    const schedule = () => {
      if (frame.current) return;
      frame.current = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [chapters]);

  useEffect(() => {
    if (!mobileOpen) return;
    const close = (event: PointerEvent) => {
      if (!mobileRef.current?.contains(event.target as Node)) setMobileOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [mobileOpen]);

  const activeLabel =
    chapters.find((chapter) => chapter.id === activeId)?.label ??
    chapters[0]?.label ??
    "Chapters";

  return (
    <>
      <nav aria-label="Tutorial chapters" className={styles.rail} style={{ "--reading-progress": progress } as CSSProperties}>
        {chapters.map((chapter) => (
          <a key={chapter.id} href={`#${chapter.id}`} className={`${styles.railLink} ${activeId === chapter.id ? styles.railLinkActive : ""}`} aria-current={activeId === chapter.id ? "location" : undefined}>
            <span className={styles.railLabel}>{chapter.label}</span><i className={styles.railDot} aria-hidden />
          </a>
        ))}
        <button className={styles.railTop} type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></svg>
        </button>
      </nav>

      <nav ref={mobileRef} aria-label="Tutorial chapters" className={styles.mobileChapters}>
        <button
          type="button"
          className={styles.mobileChapterTrigger}
          aria-expanded={mobileOpen}
          aria-controls="mobile-chapter-menu"
          onClick={() => setMobileOpen((value) => !value)}
        >
          <span className={styles.mobileChapterCurrent}>{activeLabel}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div id="mobile-chapter-menu" className={`${styles.mobileChapterMenu} ${mobileOpen ? styles.mobileChapterMenuOpen : ""}`}>
          {chapters.map((chapter, index) => (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              className={`${styles.mobileChapterLink} ${activeId === chapter.id ? styles.mobileChapterLinkActive : ""}`}
              aria-current={activeId === chapter.id ? "location" : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {chapter.label}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}
