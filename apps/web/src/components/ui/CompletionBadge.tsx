import type { ButtonHTMLAttributes } from "react";

import styles from "./CompletionBadge.module.css";

interface CompletionBadgeProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  complete: boolean;
}

export function CompletionBadge({ complete, className, type = "button", ...props }: CompletionBadgeProps) {
  const status = complete ? "Complete" : "Incomplete";

  return (
    <button
      type={type}
      aria-label={complete ? status : `${status} — mark complete`}
      aria-pressed={complete}
      className={[styles.root, complete ? styles.complete : styles.incomplete, className].filter(Boolean).join(" ")}
      {...props}
    >
      <svg className={styles.seal} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path className={styles.badgeShape} d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
        <path className={styles.check} d="m9 12 2 2 4-4" />
      </svg>
      <span className={styles.tooltip} role="tooltip">{status}</span>
    </button>
  );
}
