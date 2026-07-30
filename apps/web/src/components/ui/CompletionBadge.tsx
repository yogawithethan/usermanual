import type { ButtonHTMLAttributes } from "react";

import styles from "./CompletionBadge.module.css";

interface CompletionBadgeProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  animate?: boolean;
  as?: "button" | "span";
  complete: boolean;
}

export function CompletionBadge({
  animate = false,
  as = "button",
  complete,
  className,
  type = "button",
  ...props
}: CompletionBadgeProps) {
  const status = complete ? "Complete" : "Incomplete";
  const classes = [
    styles.root,
    complete ? styles.complete : styles.incomplete,
    animate ? styles.animate : null,
    as === "span" ? styles.static : null,
    className,
  ].filter(Boolean).join(" ");
  const artwork = (
    <svg className={styles.seal} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path className={styles.badgeShape} d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path className={styles.check} d="m9 12 2 2 4-4" />
    </svg>
  );

  if (as === "span") {
    return <span aria-hidden className={classes}>{artwork}</span>;
  }

  return (
    <button
      type={type}
      aria-label={complete ? status : `${status} — mark complete`}
      aria-pressed={complete}
      className={classes}
      {...props}
    >
      {artwork}
      <span className={styles.tooltip} role="tooltip">{status}</span>
    </button>
  );
}
