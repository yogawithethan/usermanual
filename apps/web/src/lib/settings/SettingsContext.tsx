"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/lib/settings/AuthContext";
import {
  PREMIUM_THEMES,
  THEME_TOKENS,
  type FontFamily,
  type ThemeId,
  type ThemeTokens,
} from "@/lib/settings/theme";

export type SleepTimer = null | 15 | 30 | 60 | "end";
export type SkipInterval = 10 | 15 | 30 | 45;
export type ScrollMode = "scroll" | "page-turn";
export type Decade = "70s" | "80s" | "90s" | "00s" | "10s";
export type HomeOrder = "levels-first" | "journey";

export type RefreshProfile = {
  decade: Decade | null;
  humor: string[];
  culture: string[];
};

export type Settings = {
  theme: ThemeId;
  fontFamily: FontFamily;
  fontSize: number;
  accentByTheme: Partial<Record<ThemeId, string | null>>;
  bionicReading: boolean;
  scrollMode: ScrollMode;
  rsvpWpm: number;
  karaokeHighlight: boolean;
  autoScrollWithAudio: boolean;
  sleepTimer: SleepTimer;
  skipInterval: SkipInterval;
  purchased: boolean;
  licenseEmail: string | null;
  devSimulateSignedIn: boolean;
  firstLaunched: boolean;
  onboarded: boolean;
  refreshProfile: RefreshProfile;
  homeOrder: HomeOrder;
};

const DEFAULTS: Settings = {
  theme: "light",
  fontFamily: "serif",
  fontSize: 17,
  accentByTheme: {},
  bionicReading: false,
  scrollMode: "scroll",
  rsvpWpm: 400,
  karaokeHighlight: true,
  autoScrollWithAudio: true,
  sleepTimer: null,
  skipInterval: 15,
  purchased: false,
  licenseEmail: null,
  devSimulateSignedIn: false,
  firstLaunched: false,
  onboarded: false,
  refreshProfile: { decade: null, humor: [], culture: [] },
  homeOrder: "levels-first",
};

const STORAGE_KEY = "um:settings:v1";

type Ctx = Settings & {
  ready: boolean;
  update: (patch: Partial<Settings>) => void;
  tokens: ThemeTokens;
  accent: string;
};

const SettingsCtx = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
      } catch {}
    }
    setReady(true);
  }, []);

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      if (writeTimer.current) clearTimeout(writeTimer.current);
      writeTimer.current = setTimeout(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }, 150);
      return next;
    });
  };

  const tokens = THEME_TOKENS[settings.theme];
  const accentOverride = settings.accentByTheme[settings.theme];
  const accent = accentOverride ?? tokens.defaultAccent;
  const { user, entitled } = useAuth();
  const effectivePurchased = user ? entitled : settings.purchased;

  useEffect(() => {
    document.documentElement.dataset.umTheme = settings.theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.umHomeOrder = settings.homeOrder;
  }, [settings.homeOrder, settings.theme]);

  const value = useMemo<Ctx>(
    () => ({
      ...settings,
      purchased: effectivePurchased,
      ready,
      update,
      tokens,
      accent,
    }),
    [accent, effectivePurchased, ready, settings, tokens],
  );

  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsCtx);
  if (!ctx) throw new Error("useSettings outside SettingsProvider");
  return ctx;
}

export function isThemePremium(id: ThemeId): boolean {
  return PREMIUM_THEMES.includes(id);
}
