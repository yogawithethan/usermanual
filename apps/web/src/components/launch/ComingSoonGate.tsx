"use client";

import { useEffect, useRef, useState } from "react";

import { Button, Divider, Eyebrow, Heading, Notice, Text, TextField } from "@/components/ui/System";

import styles from "./ComingSoonGate.module.css";

// The page renders normally first; the gate arrives once the visitor has seen it.
const REVEAL_DELAY_MS = 1600;

type InterestState = "idle" | "sending" | "done" | "error";

export function ComingSoonGate({
  checkoutUrl,
  priceLabel,
  fullPriceLabel,
}: {
  checkoutUrl: string;
  priceLabel: string;
  fullPriceLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [interest, setInterest] = useState<InterestState>("idle");
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(true), REVEAL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (open) cardRef.current?.focus();
  }, [open]);

  async function submitInterest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!email) return;
    setInterest("sending");
    try {
      const response = await fetch("/api/release-interest/user-manual", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setInterest(response.ok ? "done" : "error");
    } catch {
      setInterest("error");
    }
  }

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <section
        ref={cardRef}
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="coming-soon-title"
        tabIndex={-1}
      >
        <Eyebrow>The User Manual</Eyebrow>
        <Heading level={2} size="display" id="coming-soon-title" className={styles.title}>
          Coming Soon
        </Heading>
        <Text size="small" tone="muted" className={styles.copy}>
          The full tutorial is almost ready. Preorder now and it unlocks for you
          the moment it launches — or leave your email and we&rsquo;ll tell you
          when it&rsquo;s out.
        </Text>

        <div className={styles.priceRow} aria-label={`Preorder price ${priceLabel}, normally ${fullPriceLabel}`}>
          <s className={styles.fullPrice}>{fullPriceLabel}</s>
          <span className={styles.price}>{priceLabel}</span>
          <span className={styles.savePill}>Preorder price</span>
        </div>
        <a href={checkoutUrl} className={styles.preorderLink}>
          Preorder for {priceLabel}
          <span aria-hidden>→</span>
        </a>

        <Divider label="or" className={styles.divider} />

        {interest === "done" ? (
          <Notice tone="success">You&rsquo;re on the list — we&rsquo;ll email you at launch.</Notice>
        ) : (
          <form className={styles.form} onSubmit={submitInterest}>
            <TextField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              error={interest === "error" ? "That didn't go through — try again?" : undefined}
            />
            <Button
              type="submit"
              variant="secondary"
              size="large"
              fullWidth
              disabled={interest === "sending"}
            >
              {interest === "sending" ? "Adding you…" : "Email me when it's out"}
            </Button>
          </form>
        )}

      </section>
    </div>
  );
}
