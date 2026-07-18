"use client";

import { ViewTransition, type CSSProperties, type MouseEventHandler } from "react";
import { useRouter } from "next/navigation";

import { useTheme } from "@/themes/ThemeProvider";
import { StatusTooltip } from "@/components/ui/StatusTooltip";

export type CloudButtonState =
  | "locked"
  | "unlocked"
  | "completed"
  | "in-progress";

export interface CloudButtonTint {
  /** Top-of-sky color (lighter) */
  skyTop: string;
  /** Bottom-of-sky color (deeper) */
  skyBottom: string;
}

export interface CloudButtonProps {
  title: string;
  /**
   * Short tag shown under the title in the expanded/hover state.
   * (e.g., "upright & confident"). Optional — omit to suppress.
   */
  subtitle?: string;
  state: CloudButtonState;
  /**
   * Per-button sky palette. If omitted, the active theme's primary pair
   * is used. Locked buttons ignore this in favor of a gray sky.
   */
  tint?: CloudButtonTint;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const LOCKED_TINT: CloudButtonTint = { skyTop: "#BBC1C8", skyBottom: "#7A828C" };

const CLOUD_MOTION = [
  {
    top: "-78px",
    topMd: "-92px",
    height: "174px",
    heightMd: "198px",
    scale: "1.02",
    from: "-22px",
    mid: "9px",
    to: "-22px",
    duration: "78s",
    delay: "-17s",
  },
  {
    top: "-62px",
    topMd: "-78px",
    height: "160px",
    heightMd: "184px",
    scale: "1.12",
    from: "18px",
    mid: "-14px",
    to: "18px",
    duration: "92s",
    delay: "-31s",
  },
  {
    top: "-72px",
    topMd: "-84px",
    height: "184px",
    heightMd: "210px",
    scale: "0.96",
    from: "-4px",
    mid: "24px",
    to: "-4px",
    duration: "108s",
    delay: "-52s",
  },
  {
    top: "-58px",
    topMd: "-72px",
    height: "168px",
    heightMd: "192px",
    scale: "1.2",
    from: "28px",
    mid: "-8px",
    to: "28px",
    duration: "84s",
    delay: "-10s",
  },
  {
    top: "-66px",
    topMd: "-80px",
    height: "176px",
    heightMd: "202px",
    scale: "1.06",
    from: "-30px",
    mid: "2px",
    to: "-30px",
    duration: "116s",
    delay: "-43s",
  },
  {
    top: "-74px",
    topMd: "-90px",
    height: "188px",
    heightMd: "214px",
    scale: "1.16",
    from: "8px",
    mid: "-26px",
    to: "8px",
    duration: "102s",
    delay: "-68s",
  },
];

export function CloudButton({ title, subtitle, state, tint, href, onClick }: CloudButtonProps) {
  const router = useRouter();
  const theme = useTheme();
  const isLocked = state === "locked";
  const activeTint =
    tint ?? { skyTop: theme.colors.primaryFrom, skyBottom: theme.colors.primaryTo };
  const effectiveTint = isLocked ? LOCKED_TINT : activeTint;

  const sky = `linear-gradient(180deg, ${effectiveTint.skyTop} 0%, ${effectiveTint.skyBottom} 100%)`;
  const levelNumber = Number(title.match(/\d+/)?.[0] ?? 1);
  const cloudImage =
    levelNumber % 2 === 0 && theme.textures.cloudImageAlt
      ? theme.textures.cloudImageAlt
      : theme.textures.cloudImage;
  const cloudMotion = CLOUD_MOTION[(levelNumber - 1) % CLOUD_MOTION.length];
  const cloudStyle = {
    "--cloud-from": cloudMotion.from,
    "--cloud-mid": cloudMotion.mid,
    "--cloud-to": cloudMotion.to,
    "--cloud-duration": cloudMotion.duration,
    "--cloud-delay": cloudMotion.delay,
    "--cloud-scale": cloudMotion.scale,
  } as CSSProperties;
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event);
    if (!event.defaultPrevented && href) {
      router.push(href, { transitionTypes: ["nav-forward"] });
    }
  };

  return (
    <ViewTransition name={`detail-level-${levelNumber}`} share="detail-morph" default="none">
      <button
      type="button"
      onClick={handleClick}
      aria-label={`${title}${subtitle ? ` — ${subtitle}` : ""} — ${state}`}
      data-ambient-paused={isLocked ? "" : undefined}
      data-state={state}
      className={[
        "shape-journey-card group relative w-full overflow-hidden",
        // Height morphs on hover — collapsed is pill-like, expanded is
        // a tall card that fits icon/title/subtitle stack.
        "min-h-[104px] md:min-h-[116px]",
        isLocked ? "" : "hover:min-h-[220px] md:hover:min-h-[244px] focus-visible:min-h-[220px] md:focus-visible:min-h-[244px]",
        "transition-[min-height] duration-300 ease-out",
        "shadow-[0_14px_30px_-18px_rgba(15,23,42,0.45)]",
        isLocked ? "cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
      style={{ background: sky }}
    >
      {/* Photographic cloud overlay, swapped per theme. */}
      {cloudImage && (
        <img
          src={cloudImage}
          aria-hidden
          alt=""
          className={[
            isLocked ? "" : "cloud-drift",
            "absolute left-1/2 w-[132%] max-w-none",
            "object-contain object-top pointer-events-none select-none",
            "opacity-75 saturate-[0.92]",
            "transition-[top,height,opacity] duration-300 ease-out",
            isLocked
              ? "grayscale opacity-42 saturate-0"
              : "group-hover:opacity-85 group-focus-visible:opacity-85",
          ].join(" ")}
          style={{
            ...cloudStyle,
            top: cloudMotion.top,
            height: cloudMotion.height,
          }}
        />
      )}

      {/* Inner edge highlight */}
      <span
        aria-hidden
        className="shape-inset-edge pointer-events-none absolute inset-[1px] border border-white/25"
      />

      {/* Title moves from the collapsed position into the expanded center. */}
      <span
        className={[
          "absolute z-[2] lowercase leading-none font-bold tracking-tight text-white",
          "left-6 top-1/2 -translate-y-1/2 md:left-7",
          "text-[28px] md:text-[32px] xl:text-[36px]",
          isLocked
            ? "text-white/82"
            : "group-hover:left-1/2 group-hover:top-[132px] group-hover:-translate-x-1/2 group-hover:text-[34px] group-focus-visible:left-1/2 group-focus-visible:top-[132px] group-focus-visible:-translate-x-1/2 group-focus-visible:text-[34px] md:group-hover:top-[146px] md:group-hover:text-[38px] md:group-focus-visible:top-[146px] md:group-focus-visible:text-[38px]",
          "transition-[left,top,transform,font-size] duration-300 ease-out",
        ].join(" ")}
        style={{
          fontFamily: "var(--theme-font-heading)",
          textShadow:
            "0 1px 2px rgba(0,0,0,0.28), 0 2px 8px rgba(12,19,45,0.32)",
        }}
      >
        {title}
      </span>

      {!isLocked && (
        <>
        <span
          aria-hidden
          className={[
            "absolute left-1/2 top-[60px] z-[1] flex h-[40px] w-[40px] -translate-x-1/2 items-center justify-center rounded-full bg-white/92 md:top-[68px] md:h-[44px] md:w-[44px]",
            "shadow-[0_8px_20px_rgba(12,19,45,0.20),inset_0_1px_0_rgba(255,255,255,0.8)]",
            "ring-1 ring-white/60",
            "opacity-0 translate-y-3 scale-[0.8]",
            "transition-[opacity,transform] duration-300 ease-out",
            "group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100",
            "group-focus-visible:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-100",
          ].join(" ")}
        >
          <CloudIcon color={deepIconColor(effectiveTint)} />
        </span>
          {subtitle && (
            <span
              aria-hidden
              className={[
                "absolute left-1/2 top-[164px] z-[2] -translate-x-1/2 rounded-full bg-white px-3 py-1 md:top-[182px]",
                "text-[12px] font-bold tracking-tight md:text-[13px]",
                "shadow-[0_2px_6px_rgba(12,19,45,0.18)]",
                "opacity-0 translate-y-2",
                "transition-[opacity,transform] duration-300 ease-out",
                "group-hover:opacity-100 group-hover:translate-y-0",
                "group-focus-visible:opacity-100 group-focus-visible:translate-y-0",
              ].join(" ")}
              style={{
                color: deepIconColor(effectiveTint),
                fontFamily: "var(--theme-font-heading)",
                fontWeight: 700,
              }}
            >
              {subtitle}
            </span>
          )}
        </>
      )}

      {/* Status chip stays anchored while the card expands. */}
      <StatusTooltip
        label={statusLabel(state)}
        className={[
          "absolute right-4 top-1/2 h-10 w-10 -translate-y-1/2 md:right-5 md:h-11 md:w-11",
          "z-10",
        ].join(" ")}
      >
        <StatusChip state={state} tint={effectiveTint} />
      </StatusTooltip>
      </button>
    </ViewTransition>
  );
}

/**
 * Pick a dark-enough "deep" color off the sky tint so inline glyphs
 * (cloud icon, subtitle text) read on the white chip. Always uses the
 * darker end of the gradient.
 */
function deepIconColor(tint: CloudButtonTint): string {
  return tint.skyBottom;
}

function statusLabel(state: CloudButtonState): string {
  if (state === "completed") {
    return "Completed — tap to revisit";
  }

  if (state === "in-progress") {
    return "In progress — continue";
  }

  if (state === "locked") {
    return "Locked — finish previous levels";
  }

  return state;
}

/** Stylized cumulus cloud glyph — shown in the expanded-state chip. */
function CloudIcon({ color }: { color: string }) {
  return (
    <span
      className="h-[19px] w-[19px] md:h-[21px] md:w-[21px]"
      style={{
        backgroundColor: color,
        mask: "url('/tutorial-icons/dse-cloud-icon.svg') center / contain no-repeat",
        WebkitMask: "url('/tutorial-icons/dse-cloud-icon.svg') center / contain no-repeat",
      }}
      aria-hidden
    />
  );
}

export function StatusChip({ state, tint }: { state: CloudButtonState; tint: CloudButtonTint }) {
  const size = "h-10 w-10 md:h-11 md:w-11";
  const baseClasses = [
    size,
    "relative inline-flex items-center justify-center overflow-hidden rounded-full",
    "backdrop-blur-[10px] backdrop-saturate-150",
    "shadow-[0_10px_24px_rgba(9,18,58,0.22),inset_0_1px_0_rgba(255,255,255,0.58),inset_0_-1px_0_rgba(20,31,80,0.08)]",
    "ring-1 ring-white/45",
  ].join(" ");
  const iconColor = state === "in-progress" ? "#FFFFFF" : deepIconColor(tint);

  if (state === "locked") {
    return (
      <span
        className={baseClasses}
        style={{
          background:
            "linear-gradient(145deg, rgba(70,76,88,0.72), rgba(35,42,54,0.52))",
          color: "#FFFFFF",
        }}
        aria-hidden
      >
        <span
          aria-hidden
          className="absolute inset-[3px] rounded-full bg-white/10 blur-[1px]"
        />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.15}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative h-[16px] w-[16px] md:h-[18px] md:w-[18px] opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.28)]"
        >
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8.5 11V8a3.5 3.5 0 1 1 7 0v3" />
        </svg>
      </span>
    );
  }

  return (
    <span
      className={baseClasses}
      style={{
        background:
          state === "in-progress"
            ? "linear-gradient(145deg, rgba(255,255,255,0.52), rgba(223,238,255,0.26))"
            : "linear-gradient(145deg, rgba(255,255,255,1), rgba(248,251,255,0.94))",
        color: iconColor,
      }}
      aria-hidden
    >
      <span
        aria-hidden
        className={[
          "absolute inset-[3px] rounded-full blur-[1px]",
          state === "in-progress" ? "bg-white/12" : "bg-white/26",
        ].join(" ")}
      />
      {state === "completed" && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative h-[15px] w-[15px] md:h-[17px] md:w-[17px] drop-shadow-[0_1px_3px_rgba(23,60,138,0.28)]"
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      )}
      {state === "in-progress" && (
        <span className="relative flex items-center gap-[3px]">
          <span className="h-[3px] w-[3px] rounded-full bg-white/82 shadow-[0_0_5px_rgba(255,255,255,0.35)]" />
          <span className="h-[3px] w-[3px] rounded-full bg-white/82 shadow-[0_0_5px_rgba(255,255,255,0.35)]" />
          <span className="h-[3px] w-[3px] rounded-full bg-white/82 shadow-[0_0_5px_rgba(255,255,255,0.35)]" />
        </span>
      )}
      {state === "unlocked" && (
        <svg
          viewBox="0 0 24 24"
          className="relative h-[15px] w-[15px] md:h-[17px] md:w-[17px]"
        >
          <path
            d="M8 5.5v13l11-6.5-11-6.5z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}
