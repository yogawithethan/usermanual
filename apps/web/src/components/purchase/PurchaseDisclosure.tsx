"use client";

import Link from "next/link";
import {
  BookOpen,
  CaretDown,
  CaretUp,
  ChatsCircle,
  DownloadSimple,
  FlowerLotus,
  Waveform,
} from "@phosphor-icons/react";
import { useId, useState } from "react";

import {
  USER_MANUAL_PRICE_LABEL,
  USER_MANUAL_PURCHASE_BENEFITS,
} from "@/lib/purchaseContract";

import styles from "./PurchaseDisclosure.module.css";

interface PurchaseDisclosureProps {
  className?: string;
  compact?: boolean;
  defaultOpen?: boolean;
  onPrimaryAction?: () => void;
  primaryHref?: string;
  primaryLabel?: string;
}

export function PurchaseDisclosure({
  className,
  compact = false,
  defaultOpen = false,
  onPrimaryAction,
  primaryHref,
  primaryLabel = "Unlock full access",
}: PurchaseDisclosureProps) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const detailsId = useId();
  const benefitIcons = [BookOpen, Waveform, ChatsCircle, DownloadSimple] as const;

  return (
    <section
      className={`${styles.root} ${compact ? styles.compact : ""} ${expanded ? styles.expanded : ""} ${className ?? ""}`}
      data-purchase-disclosure
      data-state={expanded ? "expanded" : "collapsed"}
      aria-label={`${USER_MANUAL_PRICE_LABEL} lifetime companion`}
    >
      <span className={styles.texture} data-ambient-purchase aria-hidden />
      <span className={styles.sheen} aria-hidden />

      <div className={styles.summary}>
        <span className={styles.emblem} aria-hidden>
          <FlowerLotus weight="regular" />
        </span>

        <span className={styles.summaryCopy}>
          <strong className={styles.summaryTitle}>Lifetime companion</strong>
          <span className={styles.summaryDetail}>
            {expanded
              ? "Unlock tutorials, practice audio, bonus materials, downloads, community, and future additions."
              : "Tutorials, practice audio, downloads, community, and future additions."}
          </span>
        </span>

        <span className={styles.price} aria-label={`${USER_MANUAL_PRICE_LABEL}, one payment`}>
          {USER_MANUAL_PRICE_LABEL}
        </span>

        {onPrimaryAction ? (
          <button className={styles.primaryAction} onClick={onPrimaryAction} type="button">
            {primaryLabel}
          </button>
        ) : (
          <Link className={styles.primaryAction} href={primaryHref ?? "/paid"}>
            {primaryLabel}
          </Link>
        )}

        <button
          type="button"
          className={styles.toggle}
          aria-controls={detailsId}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse lifetime offer" : "Expand lifetime offer"}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? <CaretDown weight="bold" /> : <CaretUp weight="bold" />}
        </button>
      </div>

      <div className={styles.reveal} id={detailsId} aria-hidden={!expanded} inert={!expanded}>
        <div className={styles.revealInner}>
          <div className={styles.expandedIntro}>
            <p className={styles.reassurance}>One payment. Yours forever.</p>
            <p>Progression still happens in order.</p>
          </div>

          <ul className={styles.benefits} aria-label="Lifetime purchase includes">
            {USER_MANUAL_PURCHASE_BENEFITS.map((benefit, index) => {
              const BenefitIcon = benefitIcons[index];
              return (
                <li className={styles.benefit} key={benefit.title}>
                  <span className={styles.benefitIcon} aria-hidden>
                    <BenefitIcon weight="regular" />
                  </span>
                  <span>
                    <strong>{benefit.title}</strong>
                    <small>{benefit.copy}</small>
                  </span>
                </li>
              );
            })}
          </ul>

          <div className={styles.mobileActions}>
            {onPrimaryAction ? (
              <button className={styles.primaryAction} onClick={onPrimaryAction} type="button">
                {primaryLabel}
              </button>
            ) : (
              <Link className={styles.primaryAction} href={primaryHref ?? "/paid"}>
                {primaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
