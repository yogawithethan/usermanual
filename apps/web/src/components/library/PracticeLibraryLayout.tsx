"use client";

import { createElement, useEffect, useRef, useState, type ReactNode } from "react";

import styles from "./HomeLibraryViews.module.css";

type PracticeView = "list" | "grid";
const STORAGE_KEY = "um:practice-view";
const SHARED_VIEW_TOGGLE_URL = "https://pub-3b18e580131f44348bc92d16ea67e216.r2.dev/assets/components/view-toggle/2026.07.17.111/view-toggle.js";

export function PracticeLibraryLayout({ children, count }: { children: ReactNode; count: number }) {
  const [view, setView] = useState<PracticeView>("list");
  const [viewHydrated, setViewHydrated] = useState(false);
  const [toggleReady, setToggleReady] = useState(false);
  const toggleRef = useRef<(HTMLElement & { config?: Record<string, unknown> }) | null>(null);
  const viewRef = useRef<PracticeView>(view);
  viewRef.current = view;

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "grid" || stored === "list") setView(stored);
    setViewHydrated(true);
  }, []);

  useEffect(() => {
    let active = true;
    const finish = () => customElements.whenDefined("ywe-view-toggle").then(() => {
      if (active) setToggleReady(true);
    });
    if (customElements.get("ywe-view-toggle")) void finish();
    else {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${SHARED_VIEW_TOGGLE_URL}"]`);
      const script = existing ?? document.createElement("script");
      if (!existing) {
        script.src = SHARED_VIEW_TOGGLE_URL;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", finish, { once: true });
    }
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const toggle = toggleRef.current;
    if (!toggleReady || !toggle || !viewHydrated) return;
    toggle.config = { ariaLabel: "Practice layout", showTooltips: true, tone: "pearl", value: viewRef.current, views: ["list", "grid"] };
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<{ value?: string }>).detail?.value;
      if (next !== "list" && next !== "grid") return;
      setView(next);
      window.localStorage.setItem(STORAGE_KEY, next);
    };
    toggle.addEventListener("ywe:view-change", onChange);
    return () => toggle.removeEventListener("ywe:view-change", onChange);
  }, [toggleReady, viewHydrated]);

  return (
    <section id="library-mode-panel" className={styles.view} role="tabpanel" aria-labelledby="library-mode-1">
      <div className={styles.practiceToolbar}>
        <p className={styles.resultCount}>{count} {count === 1 ? "practice" : "practices"}</p>
        <span className={styles.viewToggleSlot}>
          {toggleReady ? createElement("ywe-view-toggle", { ref: toggleRef }) : null}
        </span>
      </div>
      <div className={styles.cardList} data-view={view}>{children}</div>
    </section>
  );
}
