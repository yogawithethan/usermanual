import { Archivo_Black, Fredoka, Livvic } from "next/font/google";

import type { Theme } from "@islands/theme";
import { universeFontClassName } from "./universeFonts";

/**
 * Heading font for DSE — rounded, chunky. Used for button labels and any
 * soft UI heading. Google Fonts retired "Fredoka One" and folded it into
 * the `Fredoka` variable family. Weight `700` is the closest match.
 */
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-dse-heading",
  display: "swap",
});

/**
 * Display font for DSE — heavy, block-letter, poster-style. Used for the
 * "THE USER MANUAL" hero. Archivo Black is ships as a single heavy cut.
 */
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dse-display",
  display: "swap",
});

const livvic = Livvic({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dse-label",
  display: "swap",
});

export const dseTheme: Theme = {
  id: "dse",
  name: "Deeper. Slower. Easier.",

  colors: {
    // Royal blue → violet. Tuned to match reference mockup.
    primaryFrom: "#3B5FE3",
    primaryTo: "#7D4FCC",
    surface: "#F4F6F8",
    ink: "#1E293B",
    muted: "#64748B",
    border: "#E2E6EB",
    locked: "#A8ADB4",
    completed: "#22C55E",
  },

  fonts: {
    heading: "var(--font-dse-heading)",
    display: "var(--font-dse-display)",
    body: "var(--font-dse-label)",
    className: `${fredoka.variable} ${archivoBlack.variable} ${livvic.variable} ${universeFontClassName}`,
  },

  radii: {
    // Soft, cloud-like — intentionally generous.
    pill: "9999px",
    card: "24px",
    sm: "12px",
  },

  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2.5rem",
  },

  textures: {
    // Placeholder gradients — will be swapped for real cloud textures later.
    primary:
      "linear-gradient(135deg, #6EC6FF 0%, #B5C9FF 55%, #A78BFA 100%)",
    muted:
      "linear-gradient(135deg, #E8EEF7 0%, #DDE3F0 100%)",
    // Photographic cloud overlays for the level cards.
    cloudImage: "/clouds/cloud-2.png",
    cloudImageAlt: "/clouds/cloud-3.png",
  },
};
