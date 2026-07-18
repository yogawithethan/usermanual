"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

interface StatusTooltipProps {
  label: string;
  children: ReactNode;
  className?: string;
  tooltipClassName?: string;
  fontFamily?: string;
  fontWeight?: number;
}

interface TooltipPosition {
  left: number;
  top: number;
  arrowLeft: number;
}

const TOOLTIP_GAP = 9;
const VIEWPORT_MARGIN = 14;

export function StatusTooltip({
  label,
  children,
  className,
  tooltipClassName,
  fontFamily = "var(--font-dse-label)",
  fontWeight = 600,
}: StatusTooltipProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition | null>(null);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    const tooltip = tooltipRef.current;

    if (!anchor || !tooltip) {
      return;
    }

    const anchorRect = anchor.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const anchorCenterX = anchorRect.left + anchorRect.width / 2;
    const idealLeft = anchorCenterX - tooltipRect.width / 2;
    const left = Math.min(
      Math.max(idealLeft, VIEWPORT_MARGIN),
      window.innerWidth - tooltipRect.width - VIEWPORT_MARGIN,
    );
    const top = Math.max(
      VIEWPORT_MARGIN,
      anchorRect.top - tooltipRect.height - TOOLTIP_GAP,
    );

    setPosition({
      left,
      top,
      arrowLeft: anchorCenterX - left,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  return (
    <>
      <span
        ref={anchorRef}
        className={className}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        <span className="absolute inset-0 scale-[0.86]">
          {children}
        </span>
      </span>
      {isOpen &&
        createPortal(
          <span
            ref={tooltipRef}
            role="tooltip"
            className={[
              "pointer-events-none fixed z-[9999]",
              "whitespace-nowrap rounded-[8px] bg-[#151515] px-3 py-1.5 text-[13px] tracking-tight text-white",
              "shadow-[0_10px_24px_rgba(0,0,0,0.28)]",
              position ? "opacity-100" : "opacity-0",
              tooltipClassName,
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              left: position?.left ?? 0,
              top: position?.top ?? 0,
              fontFamily,
              fontWeight,
            }}
          >
            {label}
            <span
              aria-hidden
              className="absolute top-full h-0 w-0 -translate-x-1/2 border-x-[7px] border-t-[8px] border-x-transparent border-t-[#151515]"
              style={{ left: position?.arrowLeft ?? "50%" } as CSSProperties}
            />
          </span>,
          document.body,
        )}
    </>
  );
}
