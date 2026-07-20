import type { HTMLAttributes } from "react";

import styles from "./PracticeUniverseName.module.css";

interface PracticeUniverseNameProps extends HTMLAttributes<HTMLSpanElement> {
  slug: string;
  title: string;
}

export function PracticeUniverseName({ slug, title, ...props }: PracticeUniverseNameProps) {
  if (slug !== "prana-fusion") {
    return <span {...props}>{title}</span>;
  }

  return (
    <span aria-label="prāna fusion" {...props}>
      <span aria-hidden>
        pr<span className={styles.macronA}>a</span>na fusion
      </span>
    </span>
  );
}
