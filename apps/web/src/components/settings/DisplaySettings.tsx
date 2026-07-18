"use client";

import { useSettings, isThemePremium } from "@/lib/settings/SettingsContext";
import { THEME_CARDS, type FontFamily, type ThemeId, withAlpha } from "@/lib/settings/theme";
import { Icon } from "@/components/settings/icons";
import { Range, SectionLabel } from "@/components/settings/SettingsPrimitives";

const FONT_OPTIONS: { id: FontFamily; label: string }[] = [
  { id: "serif", label: "Serif" },
  { id: "sans", label: "Sans-serif" },
];

const ACCENT_SWATCHES = [
  "#2563eb",
  "#60a5fa",
  "#b4653a",
  "#9a8fb8",
  "#7a9b76",
  "#c1666b",
  "#d4a574",
  "#5b6c8c",
];

export function DisplaySettings() {
  const { theme, fontFamily, fontSize, accentByTheme, purchased, accent, tokens, update } =
    useSettings();
  const themeAccent = accentByTheme[theme] ?? null;

  const setAccent = (hex: string | null) => {
    update({ accentByTheme: { ...accentByTheme, [theme]: hex } });
  };

  return (
    <div className="grid gap-6 px-4 py-4">
      <section>
        <SectionLabel>Theme</SectionLabel>
        <div className="grid grid-cols-4 gap-2">
          {THEME_CARDS.map((card) => {
            const selected = theme === card.id;
            const locked = !purchased && isThemePremium(card.id);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  if (!locked) update({ theme: card.id as ThemeId });
                }}
                className="shape-card relative p-2 text-center transition active:opacity-80"
                style={{
                  border: `1px solid ${selected ? accent : tokens.pillBorder}`,
                  backgroundColor: selected ? withAlpha(accent, 0.1) : "transparent",
                }}
              >
                <span
                  className="shape-control flex h-10 w-full items-center justify-center border text-[15px] font-bold"
                  style={{
                    backgroundColor: card.bg,
                    borderColor: "rgba(0,0,0,0.06)",
                    color: card.ink,
                    opacity: locked ? 0.55 : 1,
                  }}
                >
                  Aa
                </span>
                <span
                  className="mt-1.5 block text-[11px] font-bold"
                  style={{
                    color: selected ? accent : tokens.inkSecondary,
                    opacity: locked ? 0.65 : 1,
                  }}
                >
                  {card.label}
                </span>
                {locked ? (
                  <span
                    className="absolute right-1.5 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full"
                    style={{ backgroundColor: withAlpha(accent, 0.18), color: accent }}
                  >
                    <Icon name="lock" className="h-2.5 w-2.5" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <SectionLabel>Text size</SectionLabel>
          <span className="text-[11px] font-bold" style={{ color: tokens.inkSecondary }}>
            {fontSize}px
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-bold" style={{ color: tokens.inkSecondary }}>
            A
          </span>
          <Range min={12} max={28} step={1} value={fontSize} onChange={(v) => update({ fontSize: v })} />
          <span className="text-[22px] font-bold" style={{ color: tokens.inkSecondary }}>
            A
          </span>
        </div>
      </section>

      <section>
        <SectionLabel>Preview</SectionLabel>
        <div
          className="shape-card p-3"
          style={{
            backgroundColor: withAlpha(accent, 0.12),
            border: `1px solid ${withAlpha(accent, 0.3)}`,
          }}
        >
          <p
            style={{
              fontFamily:
                fontFamily === "serif" ? "Georgia, serif" : "var(--theme-font-body)",
              fontSize,
              lineHeight: `${fontSize * 1.5}px`,
              color: tokens.ink,
            }}
          >
            Chapter 1: Pleasure
          </p>
          <p
            className="mt-0.5 italic"
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 13,
              color: accent,
            }}
          >
            Annica
          </p>
        </div>
      </section>

      <section>
        <SectionLabel>Font</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map((option) => {
            const selected = fontFamily === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => update({ fontFamily: option.id })}
                className="shape-control px-3 py-2.5 text-[14px] font-bold transition active:opacity-70"
                style={{
                  fontFamily:
                    option.id === "serif" ? "Georgia, serif" : "var(--theme-font-body)",
                  border: `1px solid ${selected ? accent : tokens.pillBorder}`,
                  backgroundColor: selected ? withAlpha(accent, 0.12) : "transparent",
                  color: selected ? accent : tokens.inkSecondary,
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <SectionLabel>Accent color</SectionLabel>
          {purchased && themeAccent ? (
            <button
              type="button"
              onClick={() => setAccent(null)}
              className="text-[11px] underline"
              style={{ color: tokens.inkTertiary }}
            >
              Reset
            </button>
          ) : null}
        </div>
        {purchased ? (
          <AccentPicker value={accent} onChange={setAccent} />
        ) : (
          <div
            className="shape-card flex items-center justify-between px-3 py-3"
            style={{ backgroundColor: withAlpha(accent, 0.08) }}
          >
            <div className="min-w-0 flex-1 pr-3">
              <p className="text-[14px] font-bold" style={{ color: tokens.ink }}>
                Custom accent color
              </p>
              <p className="mt-0.5 text-[12px]" style={{ color: tokens.inkTertiary }}>
                Tint the app with any color you like.
              </p>
            </div>
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: withAlpha(accent, 0.22), color: accent }}
            >
              <Icon name="lock" className="h-3.5 w-3.5" />
            </span>
          </div>
        )}
      </section>
    </div>
  );
}

function AccentPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  const { tokens } = useSettings();

  const randomize = () => {
    const hex = `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")}`;
    onChange(hex);
  };

  return (
    <div
      className="shape-card p-3"
      style={{
        backgroundColor: tokens.bg,
        border: `1px solid ${tokens.pillBorder}`,
        boxShadow: "0 8px 18px rgba(0,0,0,0.05)",
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-1.5">
        {ACCENT_SWATCHES.map((hex) => {
          const selected = value.toLowerCase() === hex.toLowerCase();
          return (
            <button
              key={hex}
              type="button"
              aria-label={`Use ${hex}`}
              onClick={() => onChange(hex)}
              className="h-[18px] w-[18px] rounded-full"
              style={{
                backgroundColor: hex,
                border: selected ? `2px solid ${tokens.ink}` : "0 solid transparent",
              }}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          className="shape-control h-11 flex-1 cursor-pointer border-0 bg-transparent p-0"
        />
        <button
          type="button"
          onClick={randomize}
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{
            border: `1px solid ${tokens.pillBorder}`,
            backgroundColor: tokens.bgSoft,
            color: tokens.ink,
          }}
        >
          <Icon name="shuffle" className="h-3.5 w-3.5" />
        </button>
      </div>
      <div
        className="shape-card mt-3 flex items-center gap-2 px-3 py-2"
        style={{ backgroundColor: tokens.bgSoft }}
      >
        <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: value }} />
        <span className="font-mono text-[13px]" style={{ color: tokens.inkSecondary }}>
          # {value.replace("#", "").toUpperCase()}
        </span>
      </div>
    </div>
  );
}
