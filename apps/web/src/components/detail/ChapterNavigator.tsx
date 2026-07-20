"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowUp, PlayCircle, Question, SealCheck, SortAscending, SortDescending, Target } from "@phosphor-icons/react";

import floatingStyles from "@/components/ui/FloatingControl.module.css";
import { useDirectionalTopChrome } from "@/components/ui/useDirectionalTopChrome";
import type { DetailChapter } from "./DetailExperience";
import { detailStyles as styles } from "./DetailExperience";

export function ChapterNavigator({ chapters }: { chapters: DetailChapter[] }) {
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);
  const mobileRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const chromeReleaseFrame = useRef(0);
  const chromeHidden = useDirectionalTopChrome();

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
    document.documentElement.toggleAttribute("data-floating-chrome-hidden", chromeHidden);
    return () => document.documentElement.removeAttribute("data-floating-chrome-hidden");
  }, [chromeHidden]);

  useEffect(() => {
    if (!mobileOpen) return;
    if (chromeReleaseFrame.current) window.cancelAnimationFrame(chromeReleaseFrame.current);
    document.documentElement.setAttribute("data-directional-chrome-frozen", "");
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const resetFrame = window.requestAnimationFrame(() => mobileMenuRef.current?.scrollTo({ top: 0 }));
    const close = (event: PointerEvent) => {
      if (!mobileRef.current?.contains(event.target as Node)) setMobileOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      window.cancelAnimationFrame(resetFrame);
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
      chromeReleaseFrame.current = window.requestAnimationFrame(() => {
        window.dispatchEvent(new Event("directional-chrome-resync"));
        document.documentElement.removeAttribute("data-directional-chrome-frozen");
        chromeReleaseFrame.current = 0;
      });
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [mobileOpen]);

  const chapterIcon = (kind: "chapter" | "complete" | "faq" | "practice" | "video" = "chapter") => {
    if (kind === "video") return <PlayCircle aria-hidden weight="regular" />;
    if (kind === "complete") return <SealCheck aria-hidden weight="regular" />;
    if (kind === "faq") return <Question aria-hidden weight="regular" />;
    if (kind === "practice") return <Target aria-hidden weight="regular" />;
    return <span className={styles.chapterGlyph} aria-hidden />;
  };

  const navigateTo = (id: string) => {
    setMobileOpen(false);
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
    }, 0);
  };

  let chapterNumber = 0;
  const mobileChapterItems = chapters.map((chapter) => ({
    ...chapter,
    sequence: (chapter.kind ?? "chapter") === "chapter" ? String(++chapterNumber).padStart(2, "0") : null,
  }));

  useEffect(() => {
    const items = chapters.map((chapter) => ({
      href: `#${chapter.id}`,
      label: chapter.label,
      active: chapter.id === activeId,
    }));
    window.YWEUserManualChapters = items;
    document.dispatchEvent(new CustomEvent("um:chapters-change", { detail: { items } }));
    return () => {
      if (window.YWEUserManualChapters === items) delete window.YWEUserManualChapters;
    };
  }, [activeId, chapters]);

  return (
    <>
      <nav aria-label="Tutorial chapters" className={styles.rail} style={{ "--reading-progress": progress } as CSSProperties}>
        {chapters.map((chapter) => (
          <a key={chapter.id} href={`#${chapter.id}`} className={`${styles.railLink} ${activeId === chapter.id ? styles.railLinkActive : ""}`} aria-current={activeId === chapter.id ? "location" : undefined}>
            <span className={styles.railLabel}>{chapter.label}</span><i className={styles.railDot} aria-hidden>{chapterIcon(chapter.kind)}</i>
          </a>
        ))}
        <button className={styles.railTop} type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></svg>
        </button>
      </nav>

      <nav ref={mobileRef} aria-label="Tutorial chapters" className={`${styles.mobileChapters} ${mobileOpen ? styles.mobileChaptersOpen : ""} ${chromeHidden ? styles.detailChromeHidden : ""}`} data-local-mobile-chapters>
        <button
          type="button"
          className={`${floatingStyles.control} ${styles.mobileChapterTrigger}`}
          aria-expanded={mobileOpen}
          aria-controls="mobile-chapter-menu"
          onClick={() => setMobileOpen((value) => !value)}
        >
          <span className="sr-only">{mobileOpen ? "Close chapters" : "Open chapters"}</span>
          {mobileOpen ? <SortDescending aria-hidden weight="regular" /> : <SortAscending aria-hidden weight="regular" />}
        </button>
        <div ref={mobileMenuRef} id="mobile-chapter-menu" className={`${styles.mobileChapterMenu} ${mobileOpen ? styles.mobileChapterMenuOpen : ""}`}>
          <div className={styles.mobileChapterMenuInner}>
            {mobileChapterItems.map((chapter) => (
              <a
                key={chapter.id}
                href={`#${chapter.id}`}
                className={`${styles.mobileChapterLink} ${activeId === chapter.id ? styles.mobileChapterLinkActive : ""}`}
                aria-current={activeId === chapter.id ? "location" : undefined}
                onClick={(event) => { event.preventDefault(); navigateTo(chapter.id); }}
              >
                <span className={styles.mobileChapterIcon}>{chapter.sequence ?? chapterIcon(chapter.kind)}</span>
                {chapter.label}
              </a>
            ))}
            <button className={styles.mobileChapterTop} type="button" onClick={() => { setMobileOpen(false); window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0); }}>
              <ArrowUp aria-hidden weight="regular" />
              <span>Back to top</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
