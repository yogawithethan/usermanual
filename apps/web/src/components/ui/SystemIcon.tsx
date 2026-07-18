import type { SVGProps } from "react";

export type SystemIconName =
  | "arrow-left"
  | "arrow-right"
  | "arrow-up"
  | "audio"
  | "book"
  | "check"
  | "chat"
  | "chevron-down"
  | "close"
  | "download"
  | "ellipsis"
  | "help"
  | "lock"
  | "lotus"
  | "play"
  | "spark"
  | "seal-check"
  | "trophy"
  | "unlock"
  | "video";

export function SystemIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: SystemIconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {iconPath(name)}
    </svg>
  );
}

function iconPath(name: SystemIconName) {
  switch (name) {
    case "arrow-left":
      return <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>;
    case "arrow-right":
      return <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>;
    case "arrow-up":
      return <><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></>;
    case "audio":
      return <><path d="M5 14v-4" /><path d="M9 17V7" /><path d="M13 20V4" /><path d="M17 17V7" /><path d="M21 14v-4" /></>;
    case "book":
      return <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v15a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5v-15Z" /></>;
    case "check":
      return <path d="m5.5 12.5 4 4 9-9" />;
    case "chat":
      return <><path d="M8.5 17.5 5 20l.8-4.2A7 7 0 1 1 8.5 17.5Z" /><path d="M9 10h.01" /><path d="M12 10h.01" /><path d="M15 10h.01" /></>;
    case "chevron-down":
      return <path d="m6 9 6 6 6-6" />;
    case "close":
      return <><path d="m7 7 10 10" /><path d="M17 7 7 17" /></>;
    case "download":
      return <><path d="M12 3v12" /><path d="m7.5 10.5 4.5 4.5 4.5-4.5" /><path d="M4 19v2h16v-2" /></>;
    case "ellipsis":
      return <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>;
    case "help":
      return <><path d="M9.2 9a3 3 0 1 1 4.9 2.3c-1.2.9-2.1 1.6-2.1 3.2" /><path d="M12 19h.01" /></>;
    case "lock":
      return <><rect x="5" y="10" width="14" height="10" rx="3" /><path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" /></>;
    case "lotus":
      return <><path d="M12 20c-4.8-2.2-7-5.5-7-9.5 3.3.4 5.6 1.8 7 4.2 1.4-2.4 3.7-3.8 7-4.2 0 4-2.2 7.3-7 9.5Z" /><path d="M12 14.7C9.4 12.8 8.5 9.9 9 6.2c1.6.8 2.6 1.8 3 3 0.4-1.2 1.4-2.2 3-3 .5 3.7-.4 6.6-3 8.5Z" /></>;
    case "play":
      return <path d="M9.25 7.85c0-1.14 1.25-1.84 2.22-1.24l6.16 3.78c.93.57.93 1.92 0 2.49l-6.16 3.78c-.97.6-2.22-.1-2.22-1.24V7.85Z" />;
    case "spark":
      return <><path d="m12 3 1.65 5.35L19 10l-5.35 1.65L12 17l-1.65-5.35L5 10l5.35-1.65L12 3Z" /><path d="m19 16 .65 2.35L22 19l-2.35.65L19 22l-.65-2.35L16 19l2.35-.65L19 16Z" /></>;
    case "seal-check":
      return <><path d="m12 2 2.2 1.8 2.8-.2.8 2.7 2.4 1.5-1 2.6 1 2.6-2.4 1.5-.8 2.7-2.8-.2L12 22l-2.2-1.8-2.8.2-.8-2.7-2.4-1.5 1-2.6-1-2.6 2.4-1.5L7 3.6l2.8.2L12 2Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>;
    case "trophy":
      return <><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M5 6H3a4 4 0 0 0 4 4" /><path d="M19 6h2a4 4 0 0 1-4 4" /></>;
    case "unlock":
      return <><rect x="5" y="10" width="14" height="10" rx="3" /><path d="M8.5 10V7.5a3.5 3.5 0 0 1 6.8-1.1" /></>;
    case "video":
      return <><rect x="4" y="6.5" width="16" height="11" rx="3" /><path d="m10 10 4.5 2-4.5 2Z" /></>;
  }
}
