"use client";

import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from "react";

import type { Theme } from "@islands/theme";

const ThemeContext = createContext<Theme | null>(null);

/**
 * Access the current theme. Throws if used outside a `<ThemeProvider>` —
 * this is deliberate: components must declare a theme ancestor to avoid
 * silent styling bugs.
 */
export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error(
      "useTheme() must be used inside a <ThemeProvider>. Wrap the relevant section of your tree with a theme.",
    );
  }
  return theme;
}

/**
 * Flatten a theme's tokens into CSS custom properties. These are painted
 * onto the provider's wrapper element, scoping them to the subtree — which
 * is exactly what lets different page sections use different themes
 * (e.g. DSE on the left, Ignorance-Is-Not-Bliss on the right) without
 * collision.
 */
function themeToCssVars(theme: Theme): CSSProperties {
  return {
    "--theme-color-primary-from": theme.colors.primaryFrom,
    "--theme-color-primary-to": theme.colors.primaryTo,
    "--theme-color-surface": theme.colors.surface,
    "--theme-color-ink": theme.colors.ink,
    "--theme-color-muted": theme.colors.muted,
    "--theme-color-border": theme.colors.border,
    "--theme-color-locked": theme.colors.locked,
    "--theme-color-completed": theme.colors.completed,

    "--theme-font-heading": theme.fonts.heading,
    "--theme-font-display": theme.fonts.display ?? theme.fonts.heading,
    "--theme-font-body": theme.fonts.body,
    "--theme-font-label": theme.fonts.body,

    "--theme-radius-pill": theme.radii.pill,
    "--theme-radius-card": theme.radii.card,
    "--theme-radius-sm": theme.radii.sm,

    "--theme-space-xs": theme.spacing.xs,
    "--theme-space-sm": theme.spacing.sm,
    "--theme-space-md": theme.spacing.md,
    "--theme-space-lg": theme.spacing.lg,
    "--theme-space-xl": theme.spacing.xl,

    "--theme-texture-primary": theme.textures.primary,
    "--theme-texture-muted": theme.textures.muted,

    // Default body font for the scope.
    fontFamily: theme.fonts.body,
    color: theme.colors.ink,
  } as CSSProperties;
}

interface ThemeProviderProps {
  theme: Theme;
  children: ReactNode;
  /**
   * Optional wrapper className. Font variable classes from the theme are
   * always applied in addition to this.
   */
  className?: string;
}

export function ThemeProvider({ theme, children, className }: ThemeProviderProps) {
  const style = useMemo(() => themeToCssVars(theme), [theme]);
  const classes = [theme.fonts.className, className].filter(Boolean).join(" ");

  return (
    <ThemeContext.Provider value={theme}>
      <div data-theme={theme.id} className={classes} style={style}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
