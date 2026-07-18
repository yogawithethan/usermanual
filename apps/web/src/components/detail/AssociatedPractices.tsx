"use client";

import { useMemo, useState } from "react";
import { detailStyles as styles } from "./DetailExperience";

export interface AssociatedPractice {
  description?: string | null;
  duration?: number | null;
  href: string;
  id: string;
  kind: string;
  title: string;
}

export function AssociatedPractices({ practices }: { practices: AssociatedPractice[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return practices;
    return practices.filter((practice) => `${practice.title} ${practice.kind} ${practice.description ?? ""}`.toLowerCase().includes(needle));
  }, [practices, query]);

  return (
    <section id="practices" className={styles.section}>
      <h2 className={styles.sectionTitle}>Practice this</h2>
      <div className={styles.practiceTools}>
        <label className="sr-only" htmlFor="detail-practice-search">Search associated practices</label>
        <input id="detail-practice-search" className={styles.search} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search these practices" />
      </div>
      {filtered.length ? (
        <div className={styles.practiceGrid}>
          {filtered.map((practice) => (
            <article className={styles.practiceCard} key={practice.id}>
              <span className={styles.practiceIcon} aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v-2" /><path d="M8 16V8" /><path d="M12 19V5" /><path d="M16 16V8" /><path d="M20 12v-2" /></svg>
              </span>
              <div>
                <p className={styles.practiceMeta}>{practice.kind}{practice.duration ? ` · ${practice.duration} min` : ""}</p>
                <h3 className={styles.practiceTitle}>{practice.title}</h3>
                {practice.description ? <p className={styles.practiceDescription}>{practice.description}</p> : null}
              </div>
              <a className={styles.practiceAction} href={practice.href} aria-label={`Open ${practice.title}`}>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5.5v13l11-6.5L8 5.5Z" /></svg>
              </a>
            </article>
          ))}
        </div>
      ) : <p className={styles.empty}>{practices.length ? "No associated practices match that search." : "Associated practices will appear here as their audio and films are finished."}</p>}
    </section>
  );
}
