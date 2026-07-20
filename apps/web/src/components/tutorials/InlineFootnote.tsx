"use client";

import { useEffect, useId, useRef, useState } from "react";

import styles from "./InlineFootnote.module.css";

export function InlineFootnote({ marker, text }: { marker: string; text: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [visibleText, setVisibleText] = useState("");
  const timer = useRef<number | null>(null);
  const prose = text.replace(/\*\*/g, "").replace(/\*/g, "").trim();

  useEffect(() => {
    if (timer.current) window.clearInterval(timer.current);
    if (!open) {
      setClosing(false);
      setVisibleText("");
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisibleText(prose);
      return;
    }

    let cursor = 0;
    timer.current = window.setInterval(() => {
      cursor = Math.min(prose.length, cursor + 4);
      setVisibleText(prose.slice(0, cursor));
      if (cursor >= prose.length && timer.current) {
        window.clearInterval(timer.current);
        timer.current = null;
      }
    }, 8);

    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [open, prose]);

  function closeNote() {
    if (timer.current) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !visibleText.length) {
      setOpen(false);
      return;
    }

    setClosing(true);
    let cursor = visibleText.length;
    timer.current = window.setInterval(() => {
      cursor = Math.max(0, cursor - 8);
      setVisibleText(prose.slice(0, cursor));
      if (cursor === 0) {
        if (timer.current) window.clearInterval(timer.current);
        timer.current = null;
        setOpen(false);
      }
    }, 8);
  }

  return (
    <span className={styles.wrap}>
      <button
        aria-controls={id}
        aria-expanded={open}
        aria-label={`${open ? "Collapse" : "Open"} footnote ${marker}`}
        className={styles.marker}
        onClick={() => open ? closeNote() : setOpen(true)}
        type="button"
      >
        {marker}
        <span className={styles.hint}>{open ? "Close note" : "Open note"}</span>
      </button>
      <span
        className={`${styles.insertion} ${open ? styles.insertionOpen : ""}`}
        id={id}
      >
        <span className={styles.noteText}> {visibleText}</span>
        {open && (visibleText.length < prose.length || closing) ? <i className={styles.caret} aria-hidden /> : null}
        {open && !closing && visibleText.length >= prose.length ? (
          <button
            aria-label={`Close footnote ${marker}`}
            className={styles.close}
            onClick={closeNote}
            type="button"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="m6 6 8 8M14 6l-8 8" />
            </svg>
          </button>
        ) : null}
      </span>
    </span>
  );
}
