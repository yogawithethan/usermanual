/**
 * Cross-surface geometry and motion primitives for the User Manual.
 *
 * These values deliberately live outside the web app. Native clients can map
 * the same named contract to platform units later without importing CSS or
 * React DOM components.
 */
export const uiSystemTokens = {
  typography: {
    display: "clamp(2.75rem, 8vw, 5.5rem)",
    title: "clamp(2rem, 5vw, 3rem)",
    heading: "1.5rem",
    subheading: "1.125rem",
    body: "1rem",
    bodySmall: "0.875rem",
    label: "0.8125rem",
    caption: "0.75rem",
  },
  control: {
    small: "2.25rem",
    medium: "2.75rem",
    large: "3rem",
    icon: "2.75rem",
  },
  layout: {
    content: "72rem",
    reading: "45rem",
    narrow: "29rem",
  },
  motion: {
    fast: "140ms",
    standard: "220ms",
    slow: "360ms",
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
  layer: {
    content: "1",
    sticky: "40",
    overlay: "60",
    tooltip: "100",
  },
} as const;

export type UiSystemTokens = typeof uiSystemTokens;
