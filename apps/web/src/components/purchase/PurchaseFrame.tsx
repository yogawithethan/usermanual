import type { ReactNode } from "react";

import {
  USER_MANUAL_PRICE_LABEL,
  USER_MANUAL_PURCHASE_BENEFITS,
} from "@/lib/purchaseContract";
import { Eyebrow, Heading, Text } from "@/components/ui/System";
import { SystemIcon, type SystemIconName } from "@/components/ui/SystemIcon";

import styles from "./PurchaseFrame.module.css";

type PurchaseFrameState = "available" | "owned";

interface PurchaseFrameProps {
  actions?: ReactNode;
  className?: string;
  compact?: boolean;
  feature?: string;
  headingLevel?: 1 | 2 | 3;
  state?: PurchaseFrameState;
}

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function PurchaseFrame({
  actions,
  className,
  compact = false,
  feature,
  headingLevel = 2,
  state = "available",
}: PurchaseFrameProps) {
  const owned = state === "owned";
  const featureCopy = feature
    ? `${feature} is included, together with every other part of the lifetime companion.`
    : "Paid tutorials, protected practice audio, downloads, community conversation, and future additions in this offer.";
  const benefitIcons: SystemIconName[] = ["book", "audio", "chat", "download"];

  return (
    <section
      className={classes(styles.frame, compact && styles.compact, owned && styles.owned, className)}
      data-purchase-frame
      data-purchase-state={state}
      aria-label={owned ? "Lifetime purchase active" : `${USER_MANUAL_PRICE_LABEL} lifetime purchase`}
    >
      <span className={styles.texture} aria-hidden />
      <span className={styles.sheen} aria-hidden />
      <div className={styles.header}>
        <span className={styles.emblem} aria-hidden>
          <SystemIcon name={owned ? "seal-check" : "lotus"} />
        </span>
        <div className={styles.intro}>
          <Eyebrow>{owned ? "Owned forever" : "The lifetime companion"}</Eyebrow>
          <Heading level={headingLevel} size={compact ? "subsection" : "section"} className={styles.title}>
            {owned ? "Your full User Manual is unlocked." : "One payment. Yours forever."}
          </Heading>
          <Text size={compact ? "small" : "body"} tone="muted" className={styles.copy}>
            {owned ? "Your access stays connected to your Yoga With Ethan account." : featureCopy}
          </Text>
        </div>
        <div className={styles.priceLockup} aria-label={owned ? "Lifetime access" : `${USER_MANUAL_PRICE_LABEL}, one payment`}>
          <span className={styles.price}>{owned ? "Lifetime" : USER_MANUAL_PRICE_LABEL}</span>
          <span className={styles.priceNote}>{owned ? "access" : "one payment"}</span>
        </div>
      </div>

      {!owned ? (
        <ul className={styles.benefits} aria-label="Lifetime purchase includes">
          {USER_MANUAL_PURCHASE_BENEFITS.map((benefit, index) => {
            const benefitIcon = benefitIcons[index];
            return (
              <li className={styles.benefit} key={benefit.title}>
                <span className={styles.benefitIcon} aria-hidden>
                  <SystemIcon name={benefitIcon} />
                </span>
                <span>
                  <strong>{benefit.title}</strong>
                  <small>{benefit.copy}</small>
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}

      {actions ? <div className={styles.actions}>{actions}</div> : null}

      {!owned ? (
        <Text size="caption" tone="muted" className={styles.footnote}>
          Purchase and progression are separate: buying never skips the free level sequence.
        </Text>
      ) : null}
    </section>
  );
}
