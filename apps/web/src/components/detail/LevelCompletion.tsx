"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useState } from "react";

import { CompletionBadge } from "@/components/ui/CompletionBadge";
import styles from "./LevelCompletion.module.css";

const CONFETTI = Array.from({ length: 72 }, (_, index) => ({
  delay: (index * 37) % 900,
  duration: 1900 + ((index * 83) % 1500),
  left: (index * 41) % 100,
  rotation: (index * 67) % 360,
  tone: index % 6,
}));

export function LevelCompletion({ initiallyComplete, level }: { initiallyComplete: boolean; level: number }) {
  const [complete, setComplete] = useState(initiallyComplete);
  const [saving, setSaving] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [error, setError] = useState("");

  async function markComplete() {
    if (complete || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/progress/levels", {
        body: JSON.stringify({ levelNumber: level, status: "completed" }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(payload.error ?? "Progress could not be saved.");
      }
      setComplete(true);
      document.dispatchEvent(new CustomEvent("ywe:tutorial-progress-changed", {
        detail: { kind: "level", levelNumber: level, status: "completed" },
      }));
      setCelebrating(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Progress could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  const nextHref = level < 6 ? `/levels/${level + 1}` : "/";
  const nextLabel = level < 6 ? `Go to Level ${level + 1}` : "Return to The User Manual";

  return (
    <>
      <section className={styles.panel} id="complete">
        <span>
          <strong>{complete ? `Level ${level} complete` : `Complete Level ${level}`}</strong>
          <small>Nothing else is required. Mark it complete whenever it feels right.</small>
          {error ? <em role="alert">{error}</em> : null}
        </span>
        <CompletionBadge complete={complete} disabled={saving || complete} onClick={markComplete} />
      </section>

      {celebrating ? (
        <>
          <div className={styles.confetti} aria-hidden>
            {CONFETTI.map((piece, index) => (
              <i
                className={styles[`tone${piece.tone}`]}
                key={index}
                style={{
                  "--confetti-delay": `${piece.delay}ms`,
                  "--confetti-duration": `${piece.duration}ms`,
                  "--confetti-left": `${piece.left}%`,
                  "--confetti-rotation": `${piece.rotation}deg`,
                } as CSSProperties}
              />
            ))}
          </div>
          <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="level-complete-title">
            <section className={styles.card}>
              <CompletionBadge complete disabled aria-hidden />
              <p className={styles.eyebrow}>Beautiful work</p>
              <h2 id="level-complete-title">Level {level} complete.</h2>
              <p>Your progress is saved. The next part of the sequence is ready whenever you are.</p>
              <Link href={nextHref} transitionTypes={["nav-forward"]}>{nextLabel}<span aria-hidden>→</span></Link>
              <button type="button" onClick={() => setCelebrating(false)}>Stay here</button>
            </section>
          </div>
        </>
      ) : null}
    </>
  );
}
