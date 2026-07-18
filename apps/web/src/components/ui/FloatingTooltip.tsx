"use client";

import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

interface FloatingTooltipProps {
  children: ReactNode;
  label: string;
  className?: string;
}

export function FloatingTooltip({ children, label, className }: FloatingTooltipProps) {
  const id = useId();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number; arrow: number; below: boolean } | null>(null);

  const place = useCallback(() => {
    const anchor = anchorRef.current;
    const tooltip = tooltipRef.current;
    if (!anchor || !tooltip) return;

    const anchorRect = anchor.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const center = anchorRect.left + anchorRect.width / 2;
    const margin = 12;
    const gap = 9;
    const left = Math.min(
      Math.max(center - tooltipRect.width / 2, margin),
      window.innerWidth - tooltipRect.width - margin,
    );
    const below = anchorRect.top < tooltipRect.height + gap + margin;
    const top = below
      ? anchorRect.bottom + gap
      : anchorRect.top - tooltipRect.height - gap;

    setPosition({ left, top, arrow: center - left, below });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  return (
    <>
      <span
        aria-describedby={open ? id : undefined}
        className={className}
        onBlur={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") setOpen(false);
        }}
        ref={anchorRef}
      >
        {children}
      </span>
      {open ? createPortal(
        <span
          className="pointer-events-none fixed z-[9999] whitespace-nowrap rounded-lg bg-[#171513] px-2.5 py-1.5 text-[11px] font-semibold leading-none text-white shadow-[0_8px_22px_rgba(0,0,0,.22)]"
          id={id}
          ref={tooltipRef}
          role="tooltip"
          style={{ left: position?.left ?? 0, opacity: position ? 1 : 0, top: position?.top ?? 0 }}
        >
          {label}
          <span
            aria-hidden
            className={`absolute left-0 h-0 w-0 -translate-x-1/2 border-x-[5px] border-x-transparent ${position?.below ? "bottom-full border-b-[6px] border-b-[#171513]" : "top-full border-t-[6px] border-t-[#171513]"}`}
            style={{ left: position?.arrow ?? "50%" }}
          />
        </span>,
        document.body,
      ) : null}
    </>
  );
}
