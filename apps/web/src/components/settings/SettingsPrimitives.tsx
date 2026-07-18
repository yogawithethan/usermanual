"use client";

import type { CSSProperties, ReactNode } from "react";

import { useSettings } from "@/lib/settings/SettingsContext";
import { withAlpha } from "@/lib/settings/theme";
import { Icon } from "@/components/settings/icons";
import styles from "./SettingsPrimitives.module.css";

export function SectionLabel({ children }: { children: ReactNode }) {
  const { tokens } = useSettings();
  return (
    <p
      className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em]"
      style={{ color: tokens.inkTertiary }}
    >
      {children}
    </p>
  );
}

export function ToggleRow({
  label,
  description,
  value,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  const { tokens } = useSettings();
  return (
    <div
      className="flex items-center justify-between gap-3 py-2"
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold" style={{ color: tokens.ink }}>
          {label}
        </p>
        {description ? (
          <p className="mt-0.5 text-[12px] leading-4" style={{ color: tokens.inkTertiary }}>
            {description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={value}
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={`${styles.toggle} disabled:cursor-not-allowed`}
        data-checked={value || undefined}
      >
        <span className={styles.toggleThumb} />
      </button>
    </div>
  );
}

export function LockedRow({
  label,
  description,
}: {
  label: string;
  description?: string;
}) {
  const { tokens, accent } = useSettings();
  return (
    <div className="flex items-center justify-between gap-3 py-2 opacity-70">
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold" style={{ color: tokens.ink }}>
          {label}
        </p>
        {description ? (
          <p className="mt-0.5 text-[12px] leading-4" style={{ color: tokens.inkTertiary }}>
            {description}
          </p>
        ) : null}
      </div>
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full"
        style={{ backgroundColor: withAlpha(accent, 0.18), color: accent }}
      >
        <Icon name="lock" className="h-3.5 w-3.5" />
      </span>
    </div>
  );
}

export function PillGroup<T extends string | number | null>({
  value,
  onChange,
  options,
  columns,
  wrap,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon?: ReactNode }[];
  columns?: number;
  wrap?: boolean;
}) {
  const { tokens } = useSettings();
  const cols = columns ?? options.length;
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));

  if (wrap) {
    return (
      <div className={styles.wrapGroup}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => onChange(option.value)}
              className={styles.wrapButton}
              data-selected={selected || undefined}
              style={{ color: selected ? tokens.ink : tokens.inkSecondary }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={styles.segmentedGroup}
      style={{
        "--segment-count": cols,
        "--segment-active": selectedIndex,
      } as CSSProperties}
    >
      <span className={styles.segmentedSlider} aria-hidden />
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={styles.segmentedButton}
            data-selected={selected || undefined}
            style={{ color: selected ? tokens.ink : tokens.inkSecondary }}
          >
            {option.icon ? <span className={styles.segmentedIcon} aria-hidden>{option.icon}</span> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Range({
  min,
  max,
  step,
  value,
  onChange,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  const { accent } = useSettings();
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.currentTarget.value))}
      className="settings-range w-full"
      style={{ accentColor: accent }}
    />
  );
}
