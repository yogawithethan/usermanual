import { Chip } from "./System";
import { SystemIcon } from "./SystemIcon";
import styles from "./ProgressionStatus.module.css";

export type ProgressionStatusState = "free" | "paid" | "locked" | "in-progress" | "completed" | "coming-soon";

const statusCopy: Record<ProgressionStatusState, { label: string; tooltip: string }> = {
  free: { label: "Free", tooltip: "Included without purchase" },
  paid: { label: "Paid", tooltip: "Included with lifetime access" },
  locked: { label: "Locked", tooltip: "Complete the prerequisite to unlock" },
  "in-progress": { label: "In progress", tooltip: "Started and ready to continue" },
  completed: { label: "Completed", tooltip: "Finished and available to revisit" },
  "coming-soon": { label: "Coming soon", tooltip: "Not released yet" },
};

export function ProgressionStatus({ state, tooltip }: { state: ProgressionStatusState; tooltip?: string }) {
  const copy = statusCopy[state];
  const tone = state === "completed" ? "success" : state === "locked" ? "locked" : "default";
  const selected = state === "paid" || state === "in-progress";

  return (
    <span className={styles.root} tabIndex={0} data-progression-state={state} aria-label={`${copy.label}: ${tooltip ?? copy.tooltip}`}>
      <Chip tone={tone} selected={selected}>
        {state === "locked" ? <SystemIcon name="lock" className={styles.icon} /> : null}
        {state === "completed" || state === "in-progress" ? <span className={styles.dot} /> : null}
        {copy.label}
      </Chip>
      <span className={styles.tooltip} role="tooltip">{tooltip ?? copy.tooltip}</span>
    </span>
  );
}
