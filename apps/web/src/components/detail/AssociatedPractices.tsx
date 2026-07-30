"use client";

import { createElement, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { SystemIcon } from "@/components/ui/SystemIcon";
import { detailStyles as styles } from "./DetailExperience";

export interface AssociatedPractice {
  description?: string | null;
  duration?: number | null;
  href: string;
  id: string;
  kind: string;
  thumbnail?: string | null;
  title: string;
}

type ArchiveElement = HTMLElement & { config?: Record<string, unknown> };
type SharedComponentsWindow = typeof window & {
  YWESharedComponents?: { loading?: Promise<unknown> };
};

const PRACTICE_ARCHIVE_STYLE_ID = "user-manual-practice-archive-skin";

function installPracticeArchiveSkin(archive: ArchiveElement) {
  const filterBar = archive.shadowRoot?.querySelector("ywe-filter-bar");
  const filterRoot = filterBar?.shadowRoot;
  if (!filterRoot || filterRoot.getElementById(PRACTICE_ARCHIVE_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = PRACTICE_ARCHIVE_STYLE_ID;
  style.textContent = `
    .rail {
      padding-bottom: 30px !important;
    }
  `;
  filterRoot.appendChild(style);
}

export function AssociatedPractices({ practices }: { practices: AssociatedPractice[] }) {
  const router = useRouter();
  const archiveRef = useRef<ArchiveElement | null>(null);
  const [ready, setReady] = useState(false);
  const items = useMemo(() => practices.map((practice) => ({
    _status: "published",
    detailUrl: practice.href,
    durationLabel: practice.duration ? `${practice.duration} min` : "Coming soon",
    durationSec: practice.duration ? practice.duration * 60 : 0,
    excerpt: practice.description ?? "A guided practice film for this tutorial.",
    id: practice.id,
    thumbnail: practice.thumbnail || "/clouds/dse-placeholder.svg",
    tier: "free",
    title: practice.title,
    topic: practice.kind.replaceAll("-", " "),
    type: "Vimeo practice",
  })), [practices]);

  useEffect(() => {
    let active = true;
    const platformReady = (window as SharedComponentsWindow).YWESharedComponents?.loading ?? Promise.resolve();
    void platformReady
      .then(() => customElements.whenDefined("ywe-library-archive"))
      .then(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready || !archiveRef.current) return;
    const archive = archiveRef.current;
    const installSkin = () => installPracticeArchiveSkin(archive);
    archive.addEventListener("ywe:component-ready", installSkin);
    archive.config = {
      collection: "youtube",
      completedIds: [],
      emptyText: "Practice videos will appear here as their Vimeo films are finished.",
      initialCount: items.length,
      items,
      pageSize: items.length,
      paginate: false,
      showProgressToggle: false,
      shuffle: false,
      view: "list",
      viewer: { loggedIn: true, tier: "om" },
      views: ["list", "grid", "rail"],
    };
    installSkin();
    const frame = requestAnimationFrame(installSkin);
    return () => {
      cancelAnimationFrame(frame);
      archive.removeEventListener("ywe:component-ready", installSkin);
    };
  }, [items, ready]);

  return (
    <section
      id="practices"
      className={`${styles.section} ${styles.practiceCollection}`}
      onClickCapture={(event) => {
        if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.nativeEvent.composedPath().find(
          (target) => target instanceof HTMLAnchorElement,
        );
        if (!link) return;
        const destination = new URL(link.href, window.location.href);
        if (destination.origin !== window.location.origin) return;
        event.preventDefault();
        window.history.replaceState(null, "", "#practices");
        router.push(`${destination.pathname}${destination.search}${destination.hash}`);
      }}
    >
      <div className={styles.practiceHeading}>
        <h2 className={styles.sectionTitle}>Practice videos</h2>
        <p>Watch the Vimeo practice collection connected to this tutorial. Unfinished films remain clearly marked until release.</p>
      </div>
      {ready ? createElement("ywe-library-archive", { ref: archiveRef }) : (
        <div className={styles.practiceFallback} aria-live="polite">
          {practices.length ? practices.map((practice) => (
            <a href={practice.href} key={practice.id}>
              <span aria-hidden><SystemIcon name="video" /></span>
              <span><strong>{practice.title}</strong><small>{practice.duration ? `${practice.duration} min` : "Coming soon"}</small></span>
              <SystemIcon name="play" aria-hidden />
            </a>
          )) : <p className={styles.empty}>Level-specific practice videos will appear here as their Vimeo films are finished.</p>}
        </div>
      )}
    </section>
  );
}
