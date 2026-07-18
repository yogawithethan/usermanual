"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { detailStyles as styles } from "./DetailExperience";

export interface InteractiveChecklistItem {
  complete?: boolean;
  group?: string;
  text: string;
}

export function InteractiveChecklist({
  heading = "Master checklist",
  id = "checklist",
  intro = "A private working list—not a gate. Check and uncheck anything as your practice changes.",
  items,
  storageKey,
}: {
  heading?: string;
  id?: string;
  intro?: string;
  items: InteractiveChecklistItem[];
  storageKey: string;
}) {
  const initial = useMemo(() => items.map((item) => Boolean(item.complete)), [items]);
  const [checked, setChecked] = useState(initial);
  const completeCount = checked.filter(Boolean).length;

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(`um-checklist:${storageKey}`) ?? "null");
      if (Array.isArray(saved) && saved.length === items.length) {
        setChecked(saved.map(Boolean));
      }
    } catch {
      // A blocked storage API should never block the tutorial itself.
    }
  }, [items.length, storageKey]);

  function toggle(index: number) {
    setChecked((current) => {
      const next = current.map((value, itemIndex) => itemIndex === index ? !value : value);
      try { window.localStorage.setItem(`um-checklist:${storageKey}`, JSON.stringify(next)); } catch { /* local persistence is a convenience */ }
      return next;
    });
  }

  return (
    <section id={id} className={`${styles.section} ${styles.checklist}`}>
      <h2 className={styles.checklistHeading}>{heading}</h2>
      <p className={styles.checklistIntro}>{intro}</p>
      <div className={styles.checklistItems}>
        {items.map((item, index) => {
          const showGroup = item.group && item.group !== items[index - 1]?.group;
          return (
            <Fragment key={`${item.group ?? "item"}-${item.text}-${index}`}>
              {showGroup ? <h3 className={styles.checkGroup}>{item.group}</h3> : null}
              <button type="button" className={`${styles.checkItem} ${checked[index] ? styles.checkItemDone : ""}`} aria-pressed={checked[index]} onClick={() => toggle(index)}>
                <span className={styles.checkMark} aria-hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg></span>
                <span className={styles.checkText}>{item.text}</span>
              </button>
            </Fragment>
          );
        })}
      </div>
      <p className={styles.checkProgress}>{completeCount} of {items.length} checked</p>
    </section>
  );
}
