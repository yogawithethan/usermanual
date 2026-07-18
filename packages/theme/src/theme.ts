/**
 * Shared theme-token contract. Every sub-project (DSE, Ignorance Is Not Bliss,
 * Content Library, Islands) supplies one `Theme` object. Components never
 * hard-code colors/fonts — they read tokens via `useTheme()` and/or the
 * CSS variables that `ThemeProvider` paints into the DOM.
 *
 * Values here are intentionally string-only: the provider emits them as
 * CSS custom properties, so any consumer (Tailwind arbitrary values, plain
 * CSS, inline style) can reference them the same way.
 */

export interface ThemeColors {
  /** Gradient start (primary brand color) */
  primaryFrom: string;
  /** Gradient end (primary brand color) */
  primaryTo: string;
  /** Page / surface background */
  surface: string;
  /** Primary text color */
  ink: string;
  /** Secondary / muted text */
  muted: string;
  /** Subtle border / divider */
  border: string;
  /** Color for "locked" / disabled states */
  locked: string;
  /** Color for "completed" states */
  completed: string;
}

export interface ThemeFonts {
  /**
   * CSS `font-family` stack for rounded UI headings (button labels, etc).
   * Typically a `var(--font-*)` reference produced by `next/font`.
   */
  heading: string;
  /**
   * CSS `font-family` stack for heavy block-letter display type
   * (e.g., the "THE USER MANUAL" hero). Optional — falls back to `heading`.
   */
  display?: string;
  /** CSS `font-family` stack for body copy */
  body: string;
  /**
   * className string that activates any `next/font` CSS variables this
   * theme depends on. Applied by `ThemeProvider` to its wrapper element.
   */
  className: string;
}

export interface ThemeRadii {
  /** Pill / fully-rounded controls */
  pill: string;
  /** Card corner radius */
  card: string;
  /** Small element radius (badges, inputs) */
  sm: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeTextures {
  /**
   * CSS `background` value for the "hero" surface — e.g. a gradient or
   * (later) a `url(...)` texture. Placeholders are fine during bring-up.
   */
  primary: string;
  /** Softer variant for disabled / locked states */
  muted: string;
  /**
   * Absolute URL (served from `/public`) of the cloud-strip image laid
   * across each CloudButton. Swap the file in `/public/clouds/` or point
   * this at a different asset to re-skin every button in the theme.
   *
   * Recommended asset: wide (≥3:1), transparent background, clouds
   * anchored to the bottom edge so they sit naturally at the top of the
   * button. SVG or PNG both work.
   */
  cloudImage?: string;
  /**
   * Optional alternate cloud image so repeated level cards do not look
   * mechanically cloned.
   */
  cloudImageAlt?: string;
}

export interface Theme {
  /** Stable identifier — useful for conditional logic and analytics */
  id: string;
  /** Human-readable name */
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  radii: ThemeRadii;
  spacing: ThemeSpacing;
  textures: ThemeTextures;
}
