"use client";

import { useState } from "react";

import { useSettings } from "@/lib/settings/SettingsContext";
import { withAlpha } from "@/lib/settings/theme";
import { Icon } from "@/components/settings/icons";

export type IslandsInfo = {
  label: string;
  intro: string;
  apps: string[];
  outro: string;
  signInHint: string;
  footer: string;
};

export function IslandsWordmark({ height = 14 }: { height?: number }) {
  const { theme } = useSettings();
  const isDark = theme === "dark" || theme === "oled";
  return (
    <img
      src={isDark ? "/islands-wordmark-light.png" : "/islands-wordmark-dark.png"}
      alt="Islands"
      className="inline-block object-contain"
      style={{
        height,
        width: height * 3.4,
        transform: `translateY(-${Math.round(height * 0.18)}px)`,
      }}
    />
  );
}

export function PoweredByIslands({ info }: { info: IslandsInfo }) {
  const { tokens, accent } = useSettings();
  const [open, setOpen] = useState(false);

  return (
    <div className="pt-1 text-center">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 py-1 text-[12px] italic active:opacity-70"
        style={{ color: tokens.inkTertiary }}
      >
        {info.label}
        <IslandsWordmark height={14} />
        <Icon name="chevron" className={["h-3 w-3 transition-transform", open ? "-rotate-90" : "rotate-90"].join(" ")} />
      </button>
      <div
        className="grid transition-[grid-template-rows,opacity] duration-200"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
        }}
      >
        <div className="overflow-hidden">
          <div
            className="shape-card mx-auto mt-2 max-w-[380px] px-4 py-3 text-left"
            style={{
              border: `1px solid ${withAlpha(accent, 0.35)}`,
              backgroundColor: withAlpha(accent, 0.05),
            }}
          >
            <p className="text-[13px] leading-[19px]" style={{ color: tokens.ink }}>
              {info.intro}{" "}
              {info.apps.map((name, index) => (
                <span key={name}>
                  <strong>{name}</strong>
                  {index < info.apps.length - 1 ? ", " : " "}
                </span>
              ))}
              {info.outro}
            </p>
            <p className="mt-2 text-[13px] leading-[19px]" style={{ color: tokens.ink }}>
              {info.signInHint}
            </p>
            <p className="mt-2 text-[11px] italic" style={{ color: tokens.inkTertiary }}>
              {info.footer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
