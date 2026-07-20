"use client";

import { useEffect, useRef, useState } from "react";

import { Button, ButtonLink, Eyebrow, Heading, IconButton, Text } from "@/components/ui/System";
import { SystemIcon } from "@/components/ui/SystemIcon";
import { PracticeUniverseName } from "@/components/typography/PracticeUniverseName";

import styles from "./CompletionUnlockNotice.module.css";

export interface CompletionUnlockItem {
  title: string;
  detail: string;
  slug?: string;
}

interface CompletionUnlockNoticeProps {
  completedLevel: number;
  items: CompletionUnlockItem[];
  primaryHref: string;
  primaryLabel: string;
  preview?: boolean;
}

export function CompletionUnlockNotice({
  completedLevel,
  items,
  primaryHref,
  primaryLabel,
  preview = false,
}: CompletionUnlockNoticeProps) {
  const [open, setOpen] = useState(true);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (preview || !open) return;

    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, preview]);

  if (!open) return null;

  return (
    <div
      className={preview ? styles.preview : styles.overlay}
      role={preview ? "status" : "dialog"}
      aria-modal={preview ? undefined : true}
      aria-labelledby={`completion-title-${completedLevel}`}
    >
      <div className={styles.card}>
        {!preview ? (
          <IconButton ref={closeRef} label="Close completion notice" className={styles.close} onClick={() => setOpen(false)}>
            <SystemIcon name="close" width="18" height="18" />
          </IconButton>
        ) : null}
        <span className={styles.heroIcon} aria-hidden>
          <SystemIcon name="trophy" width="27" height="27" />
        </span>
        <Eyebrow>Level {completedLevel} complete</Eyebrow>
        <Heading id={`completion-title-${completedLevel}`} level={2} size="title" style={{ marginTop: "0.45rem" }}>
          Beautiful. Keep going.
        </Heading>
        <Text tone="muted" className={styles.copy} style={{ marginTop: "0.75rem" }}>
          {items.length > 0
            ? "Your roadmap has opened up. Here’s what is available next."
            : "You’ve completed everything currently available. The next release will meet you here."}
        </Text>
        {items.length > 0 ? (
          <ul className={styles.unlockList} aria-label="Newly unlocked">
            {items.map((item) => (
              <li className={styles.unlockItem} key={item.title}>
                <span className={styles.unlockIcon} aria-hidden><SystemIcon name="unlock" width="18" height="18" /></span>
                <span>
                  <strong className={styles.itemTitle}>
                    {item.slug ? <PracticeUniverseName slug={item.slug} title={item.title} /> : item.title}
                  </strong>
                  <span className={styles.itemDetail}>{item.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <div className={styles.actions}>
          <ButtonLink href={primaryHref} fullWidth>{primaryLabel}</ButtonLink>
          {preview ? null : <Button type="button" variant="ghost" fullWidth onClick={() => setOpen(false)}>Stay on roadmap</Button>}
        </div>
      </div>
    </div>
  );
}
