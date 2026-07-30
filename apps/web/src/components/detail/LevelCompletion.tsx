"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

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
  const [animating, setAnimating] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [error, setError] = useState("");
  const celebrationTimer = useRef(0);

  useEffect(() => () => {
    if (celebrationTimer.current) window.clearTimeout(celebrationTimer.current);
  }, []);

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
      setAnimating(true);
      celebrationTimer.current = window.setTimeout(() => {
        setAnimating(false);
        setCelebrating(true);
        celebrationTimer.current = 0;
      }, 680);
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
      <button
        aria-label={complete ? "Level complete" : `Mark Level ${level} complete`}
        aria-pressed={complete}
        className={styles.panel}
        disabled={saving || complete}
        id="complete"
        onClick={markComplete}
        type="button"
      >
        <span>
          <strong>{complete ? "Level complete" : "Complete level"}</strong>
          {error ? <em role="alert">{error}</em> : null}
        </span>
        <CompletionBadge
          animate={animating}
          as="span"
          complete={complete}
        />
      </button>

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
