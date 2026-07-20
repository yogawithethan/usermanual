"use client";

import { useEffect, useMemo, useState } from "react";

import { renderMarkdownInline, type MarkdownFootnote } from "./MarkdownInline";
import styles from "./MarkdownContent.module.css";

export interface TutorialChecklistItem {
  checked: boolean;
  text: string;
}

export function TutorialChecklist({
  footnotes,
  items,
  storageKey,
}: {
  footnotes: MarkdownFootnote[];
  items: TutorialChecklistItem[];
  storageKey: string;
}) {
  const initial = useMemo(() => items.map((item) => item.checked), [items]);
  const [checked, setChecked] = useState(initial);
  const completeCount = checked.filter(Boolean).length;

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "null");
      if (Array.isArray(saved) && saved.length === items.length) setChecked(saved.map(Boolean));
    } catch {
      // The checklist remains fully usable if browser storage is unavailable.
    }
  }, [items.length, storageKey]);

  function toggle(index: number) {
    setChecked((current) => {
      const next = current.map((value, itemIndex) => itemIndex === index ? !value : value);
      try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* persistence is optional */ }
      return next;
    });
  }

  return (
    <div className={styles.checklist} aria-label="Mastery checklist">
      <div className={styles.checklistItems}>
        {items.map((item, index) => (
          <button
            aria-pressed={checked[index]}
            className={`${styles.checkItem} ${checked[index] ? styles.checkItemDone : ""}`}
            key={`${item.text}-${index}`}
            onClick={() => toggle(index)}
            type="button"
          >
            <span className={styles.checkMark} aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>
            </span>
            <span className={styles.checkText}>{renderMarkdownInline(item.text, footnotes, `check-${index}`)}</span>
          </button>
        ))}
      </div>
      <p className={styles.checkProgress}>{completeCount} of {items.length} checked</p>
    </div>
  );
}
