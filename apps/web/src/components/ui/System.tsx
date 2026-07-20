import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  Ref,
} from "react";

import styles from "./System.module.css";
import { SystemIcon } from "./SystemIcon";

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function Stack({ gap, className, style, ...props }: HTMLAttributes<HTMLDivElement> & { gap?: string }) {
  return <div className={classes(styles.stack, className)} style={{ "--stack-gap": gap, ...style } as CSSProperties} {...props} />;
}

export function Cluster({ gap, className, style, ...props }: HTMLAttributes<HTMLDivElement> & { gap?: string }) {
  return <div className={classes(styles.cluster, className)} style={{ "--cluster-gap": gap, ...style } as CSSProperties} {...props} />;
}

export function ChipRail({ gap, className, style, ...props }: HTMLAttributes<HTMLDivElement> & { gap?: string }) {
  return <div className={classes(styles.chipRail, className)} style={{ "--chip-rail-gap": gap, ...style } as CSSProperties} {...props} />;
}

export function Eyebrow({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={classes(styles.eyebrow, className)} {...props} />;
}

type HeadingLevel = 1 | 2 | 3 | 4;
type HeadingSize = "display" | "title" | "section" | "subsection";

export function Heading({ level = 2, size = "section", className, ...props }: HTMLAttributes<HTMLHeadingElement> & { level?: HeadingLevel; size?: HeadingSize }) {
  const Tag = `h${level}` as const;
  return <Tag className={classes(styles.heading, styles[`heading${size[0].toUpperCase()}${size.slice(1)}` as keyof typeof styles], className)} {...props} />;
}

export function Text({ size = "body", tone = "default", className, ...props }: HTMLAttributes<HTMLParagraphElement> & { size?: "body" | "small" | "caption"; tone?: "default" | "muted" | "strong" }) {
  return <p className={classes(styles.text, styles[`text${size[0].toUpperCase()}${size.slice(1)}` as keyof typeof styles], tone !== "default" && styles[`text${tone[0].toUpperCase()}${tone.slice(1)}` as keyof typeof styles], className)} {...props} />;
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "rainbow" | "premium" | "theme";
type ButtonSize = "small" | "medium" | "large";

function buttonClassName(variant: ButtonVariant, size: ButtonSize, fullWidth?: boolean, className?: string) {
  return classes(
    styles.button,
    variant !== "primary" && styles[`button${variant[0].toUpperCase()}${variant.slice(1)}` as keyof typeof styles],
    styles[`button${size[0].toUpperCase()}${size.slice(1)}` as keyof typeof styles],
    fullWidth && styles.buttonFull,
    variant === "rainbow" && "rainbow-fill",
    className,
  );
}

export function Button({ variant = "primary", size = "medium", fullWidth, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean }) {
  return <button className={buttonClassName(variant, size, fullWidth, className)} {...props} />;
}

export function ButtonLink({ href, variant = "primary", size = "medium", fullWidth, className, children, transitionTypes }: { href: string; variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean; className?: string; children: ReactNode; transitionTypes?: string[] }) {
  return <Link href={href} transitionTypes={transitionTypes} className={buttonClassName(variant, size, fullWidth, className)}>{children}</Link>;
}

export function IconButton({ label, className, children, ref, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; ref?: Ref<HTMLButtonElement> }) {
  return <button ref={ref} type="button" aria-label={label} className={classes(styles.iconButton, className)} {...props}>
    <span className={styles.iconTooltip} role="tooltip">{label}</span>
    {children}
  </button>;
}

function chipClassName(selected?: boolean, tone: "default" | "success" | "locked" = "default", interactive?: boolean, className?: string) {
  return classes(styles.chip, selected && styles.chipSelected, tone === "success" && styles.chipSuccess, tone === "locked" && styles.chipLocked, interactive && styles.chipInteractive, className);
}

export function Chip({ selected, tone = "default", className, children, ...props }: HTMLAttributes<HTMLSpanElement> & { selected?: boolean; tone?: "default" | "success" | "locked" }) {
  return <span className={chipClassName(selected, tone, false, className)} {...props}>{children}</span>;
}

export function ChipButton({ selected, tone = "default", className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; tone?: "default" | "success" | "locked" }) {
  return <button type="button" aria-pressed={selected} className={chipClassName(selected, tone, true, className)} {...props}>{children}</button>;
}

export function Divider({ label, align = "center", className }: { label?: string; align?: "center" | "start"; className?: string }) {
  return <div className={classes(styles.divider, align === "start" && styles.dividerStart, className)} role="separator">{label ? <span>{label}</span> : null}</div>;
}

export function Surface({ variant = "card", padding = "medium", className, ...props }: HTMLAttributes<HTMLDivElement> & { variant?: "card" | "panel" | "inset" | "plain"; padding?: "none" | "small" | "medium" | "large" }) {
  return <div className={classes(styles.surface, styles[`surface${variant[0].toUpperCase()}${variant.slice(1)}` as keyof typeof styles], padding !== "none" && styles[`padding${padding[0].toUpperCase()}${padding.slice(1)}` as keyof typeof styles], className)} {...props} />;
}

export function Notice({ tone = "info", className, children, ...props }: HTMLAttributes<HTMLDivElement> & { tone?: "info" | "error" | "warning" | "success" }) {
  return <div role={tone === "error" ? "alert" : "status"} className={classes(styles.notice, tone !== "info" && styles[`notice${tone[0].toUpperCase()}${tone.slice(1)}` as keyof typeof styles], className)} {...props}>{children}</div>;
}

export function TextField({ label, hint, error, id, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  const inputId = id ?? `field-${props.name ?? label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const messageId = `${inputId}-message`;
  return <label className={classes(styles.fieldGroup, className)} htmlFor={inputId}>
    <span className={styles.fieldLabel}>{label}</span>
    <input id={inputId} aria-invalid={Boolean(error)} aria-describedby={hint || error ? messageId : undefined} className={classes(styles.field, Boolean(error) && styles.fieldError)} {...props} />
    {hint || error ? <span id={messageId} className={classes(styles.fieldHint, Boolean(error) && styles.fieldErrorText)}>{error ?? hint}</span> : null}
  </label>;
}

export function Checkbox({ label, className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: ReactNode }) {
  return <label className={classes(styles.checkboxLabel, className)}>
    <input type="checkbox" className={styles.checkboxInput} {...props} />
    <span className={styles.checkboxControl} aria-hidden><SystemIcon name="check" className={styles.checkboxMark} width="14" height="14" strokeWidth="2.8" /></span>
    <span>{label}</span>
  </label>;
}

export function EmptyState({ icon, title, copy, action, className }: { icon: ReactNode; title: string; copy: string; action?: ReactNode; className?: string }) {
  return <div className={classes(styles.emptyState, className)}>
    <span className={styles.emptyIcon} aria-hidden>{icon}</span>
    <Heading level={3} size="subsection">{title}</Heading>
    <Text size="small" tone="muted" style={{ marginTop: "0.5rem" }}>{copy}</Text>
    {action ? <div style={{ marginTop: "1rem" }}>{action}</div> : null}
  </div>;
}

export function Skeleton({ width = "100%", height = "1rem", className }: { width?: string; height?: string; className?: string }) {
  return <span aria-hidden className={classes(styles.skeleton, className)} style={{ display: "block", width, height }} />;
}
