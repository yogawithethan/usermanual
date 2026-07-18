"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  DEV_PROGRESS_COOKIE,
  type DevProgressMode,
} from "@/lib/dev-progress";

interface DevProgressMenuProps {
  initialMode: DevProgressMode;
}

const MODES: Array<{
  value: DevProgressMode;
  label: string;
  detail: string;
}> = [
  {
    value: "real",
    label: "Real",
    detail: "Supabase progress",
  },
  {
    value: "half",
    label: "Half",
    detail: "Levels 1-3 done",
  },
  {
    value: "all",
    label: "All",
    detail: "Everything unlocked",
  },
];

export function DevProgressMenu({ initialMode }: DevProgressMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState(initialMode);

  function applyMode(nextMode: DevProgressMode) {
    const maxAge = nextMode === "real" ? 0 : 60 * 60 * 24 * 7;
    document.cookie = `${DEV_PROGRESS_COOKIE}=${nextMode}; path=/; max-age=${maxAge}; samesite=lax`;
    setMode(nextMode);
    setIsOpen(false);
    router.refresh();
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        type="button"
        aria-label="Open dev progress controls"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#151515] text-white shadow-[0_12px_28px_rgba(12,19,45,0.24)] ring-1 ring-white/20 transition-transform active:scale-95"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.2}
          aria-hidden
        >
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
          <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.05.05a2.2 2.2 0 1 1-3.11 3.11l-.05-.05a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.1 1.66V21.5a2.2 2.2 0 0 1-4.4 0v-.11a1.8 1.8 0 0 0-1.1-1.66 1.8 1.8 0 0 0-1.98.36l-.05.05a2.2 2.2 0 1 1-3.11-3.11l.05-.05A1.8 1.8 0 0 0 3.34 15a1.8 1.8 0 0 0-1.66-1.1H1.5a2.2 2.2 0 0 1 0-4.4h.18a1.8 1.8 0 0 0 1.66-1.1 1.8 1.8 0 0 0-.36-1.98l-.05-.05a2.2 2.2 0 1 1 3.11-3.11l.05.05a1.8 1.8 0 0 0 1.98.36 1.8 1.8 0 0 0 1.1-1.66V1.5a2.2 2.2 0 0 1 4.4 0v.51a1.8 1.8 0 0 0 1.1 1.66 1.8 1.8 0 0 0 1.98-.36l.05-.05a2.2 2.2 0 1 1 3.11 3.11l-.05.05a1.8 1.8 0 0 0-.36 1.98 1.8 1.8 0 0 0 1.66 1.1h.18a2.2 2.2 0 0 1 0 4.4h-.18A1.8 1.8 0 0 0 19.4 15z" />
        </svg>
      </button>

      {isOpen && (
        <section className="shape-card absolute bottom-14 right-0 w-[220px] bg-white p-2 text-[#151515] shadow-[0_18px_44px_rgba(12,19,45,0.18)] ring-1 ring-black/10">
          <div className="px-3 py-2">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
              Dev progress
            </p>
          </div>
          <div className="flex flex-col gap-1">
            {MODES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => applyMode(option.value)}
                className={[
                  "shape-control flex items-center justify-between px-3 py-2 text-left transition-colors",
                  mode === option.value
                    ? "bg-[#151515] text-white"
                    : "bg-transparent text-[#151515] hover:bg-[#F1F5F9]",
                ].join(" ")}
              >
                <span>
                  <span className="block text-[14px] font-bold">{option.label}</span>
                  <span
                    className={[
                      "block text-[12px]",
                      mode === option.value ? "text-white/70" : "text-[#64748B]",
                    ].join(" ")}
                  >
                    {option.detail}
                  </span>
                </span>
                {mode === option.value && (
                  <span aria-hidden className="text-[14px] font-bold">
                    On
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
