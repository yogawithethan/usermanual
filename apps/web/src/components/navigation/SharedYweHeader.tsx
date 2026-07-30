"use client";

import { createElement, useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import {
  DEV_PROGRESS_COOKIE,
  devCompletedLevelCount,
  normalizeDevProgressMode,
} from "@/lib/dev-progress";
import { useAuth } from "@/lib/settings/AuthContext";
import { useSettings } from "@/lib/settings/SettingsContext";
import { observeDirectionalTopChrome } from "@/components/ui/useDirectionalTopChrome";

const SHARED_COMPONENT_LOADER_URL = "/shared-components/loader.js";
const USER_MANUAL_AUTH_STYLE_ID = "user-manual-auth-skin";
const USER_MANUAL_AUTH_STYLES = `
  :host([detail-page]) .bar {
    border-color: transparent !important;
    background: transparent !important;
    box-shadow: none !important;
  }
  @media (min-width: 768px) {
    :host([detail-page]) .bar {
      top: max(20px, env(safe-area-inset-top)) !important;
      height: 40px !important;
    }
    :host([detail-page]) .slot-left { gap: 7px !important; }
  }
  :host([detail-page]) .mt-title-group { display: none !important; }
  .auth-scrim {
    z-index: 20119 !important;
    background: rgba(18, 18, 24, .42) !important;
    backdrop-filter: blur(14px) saturate(1.06) !important;
    -webkit-backdrop-filter: blur(14px) saturate(1.06) !important;
  }
  .auth-sheet {
    isolation: isolate;
    z-index: 20120 !important;
    overflow: hidden auto !important;
    border: 1.5px solid transparent !important;
    border-radius: 46px !important;
    corner-shape: squircle;
    background:
      linear-gradient(rgba(255,255,255,.91), rgba(255,255,255,.87)) padding-box,
      linear-gradient(118deg, rgba(255,171,197,.7), rgba(255,235,168,.68) 27%, rgba(164,235,221,.66) 54%, rgba(175,197,255,.7) 78%, rgba(225,178,255,.68)) border-box !important;
    box-shadow: 0 28px 80px rgba(12,19,45,.24), inset 0 1px 0 #fff !important;
    color: #211f1e !important;
    font-family: Poppins, Inter, system-ui, sans-serif !important;
  }
  .auth-sheet::before {
    position: absolute;
    z-index: -1;
    inset: 0;
    background: url('/textures/lifetime-offer-pearl.png') center / cover;
    content: '';
    opacity: .34;
    pointer-events: none;
  }
  .auth-x {
    z-index: 3;
    display: inline-flex !important;
    width: 38px;
    height: 38px;
    align-items: center;
    justify-content: center;
    padding: 0 !important;
    border: 1px solid rgba(255,255,255,.76) !important;
    border-radius: 50% !important;
    background: rgba(255,255,255,.68) !important;
    box-shadow: 0 7px 18px rgba(39,31,28,.08), inset 0 1px #fff;
    backdrop-filter: blur(14px);
  }
  .auth-pills {
    border: 1px solid rgba(255,255,255,.78);
    background: rgba(255,255,255,.42) !important;
    box-shadow: inset 0 1px #fff, 0 7px 19px rgba(48,39,34,.05);
    corner-shape: superellipse(1.25);
  }
  .auth-glider {
    background: rgba(255,255,255,.92) !important;
    box-shadow: 0 6px 16px rgba(33,29,27,.09), inset 0 1px #fff !important;
  }
  .auth-sheet[data-mode="signin"] .auth-pill[data-mode="signin"],
  .auth-sheet[data-mode="signup"] .auth-pill[data-mode="signup"] {
    color: #211f1e !important;
  }
  .auth-title { font-weight: 750; letter-spacing: -.035em; }
  .auth-copy { max-width: 340px; text-wrap: balance; }
  .auth-email {
    border-radius: 999px !important;
    corner-shape: superellipse(1.25);
    background: rgba(255,255,255,.76) !important;
  }
  .auth-continue {
    border-radius: 999px !important;
    corner-shape: superellipse(1.25);
    box-shadow: 0 8px 20px rgba(12,13,17,.17) !important;
    transition: box-shadow 200ms ease, opacity 160ms ease !important;
  }
  .auth-continue svg { transition: transform 220ms cubic-bezier(.22,1,.36,1); }
  .auth-continue:hover { transform: none !important; box-shadow: 0 9px 22px rgba(12,13,17,.2) !important; }
  .auth-continue:hover svg { transform: translateX(3px); }
  .auth-assurance {
    max-width: 310px;
    margin-inline: auto !important;
    text-wrap: balance;
  }
  :host([data-um-theme="dark"]) .auth-sheet {
    background:
      linear-gradient(rgba(31,33,39,.97), rgba(22,24,29,.95)) padding-box,
      linear-gradient(118deg, rgba(255,171,197,.46), rgba(255,235,168,.42) 27%, rgba(164,235,221,.4) 54%, rgba(175,197,255,.48) 78%, rgba(225,178,255,.44)) border-box !important;
    box-shadow: 0 28px 80px rgba(0,0,0,.58), inset 0 1px 0 rgba(255,255,255,.11) !important;
    color: #f3f4f6 !important;
  }
  :host([data-um-theme="dark"]) .auth-sheet::before { opacity: .09; }
  :host([data-um-theme="dark"]) .auth-x,
  :host([data-um-theme="dark"]) .auth-pills,
  :host([data-um-theme="dark"]) .auth-email {
    border-color: rgba(255,255,255,.12) !important;
    background: rgba(255,255,255,.07) !important;
    box-shadow: inset 0 1px rgba(255,255,255,.09) !important;
    color: #f3f4f6 !important;
  }
  :host([data-um-theme="dark"]) .auth-glider {
    background: rgba(255,255,255,.12) !important;
    box-shadow: 0 6px 16px rgba(0,0,0,.25), inset 0 1px rgba(255,255,255,.1) !important;
  }
  :host([data-um-theme="dark"]) .auth-sheet[data-mode="signin"] .auth-pill[data-mode="signin"],
  :host([data-um-theme="dark"]) .auth-sheet[data-mode="signup"] .auth-pill[data-mode="signup"] {
    color: #fff !important;
  }
  @media (max-width: 767px) {
    .auth-sheet {
      left: 50% !important;
      right: auto !important;
      top: 50% !important;
      bottom: auto !important;
      display: block !important;
      width: min(440px, calc(100vw - 28px)) !important;
      max-height: calc(100dvh - 28px) !important;
      padding: 28px 20px 22px !important;
      border: 1.5px solid transparent !important;
      border-radius: 40px !important;
      opacity: 0 !important;
      transform: translate(-50%, -46%) scale(.97) !important;
      pointer-events: none !important;
      transition: opacity 200ms ease, transform 320ms cubic-bezier(.22,1,.36,1) !important;
    }
    :host(.auth-open) .auth-sheet {
      opacity: 1 !important;
      transform: translate(-50%, -50%) scale(1) !important;
      pointer-events: auto !important;
    }
    .auth-body { width: 100% !important; margin: 0 !important; }
    .auth-x { top: 14px !important; right: 14px !important; }
    :host(.auth-open) .bar { pointer-events: none !important; }
  }
`;
type SharedHeaderElement = HTMLElement & {
  configure?: (patch: Record<string, unknown>) => void;
};

type SharedComponentPlatform = {
  loading?: Promise<unknown>;
  loadingHeader?: Promise<unknown>;
};

type SharedTutorialJourney = {
  signedIn: boolean;
  access: {
    completedLevels: number[];
    entitled: boolean;
    levelProgress: Array<{ level_number: number; status: string }>;
  };
  profile: { welcomeCompletedAt: number | null };
  practices: Array<{ practice_id: string; status: string }>;
};

declare global {
  interface Window {
    YWEUserManualChapters?: Array<{ href: string; label: string; active?: boolean }>;
    YWESharedComponents?: SharedComponentPlatform;
    drstiAuth?: () => "logged_out" | "no_sub" | "plus" | "ruby" | "om";
    drstiTutorialJourney?: SharedTutorialJourney;
  }
}

function installUserManualAuthSkin(header: SharedHeaderElement) {
  const shadowRoot = header.shadowRoot;
  if (!shadowRoot || shadowRoot.getElementById(USER_MANUAL_AUTH_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = USER_MANUAL_AUTH_STYLE_ID;
  style.textContent = USER_MANUAL_AUTH_STYLES;
  shadowRoot.appendChild(style);
}

export function SharedYweHeader() {
  const [ready, setReady] = useState(false);
  const { entitled, ready: authReady, user } = useAuth();
  const { devSimulateSignedIn, purchased, ready: settingsReady, theme, update } = useSettings();
  const headerRef = useRef<SharedHeaderElement | null>(null);
  const pathname = usePathname();
  const isDetailPage = /^\/(levels|universes)\//.test(pathname);
  const enabled = !pathname.startsWith("/ui-lab");
  const signedIn = Boolean(user || devSimulateSignedIn);
  const isDark = theme === "dark" || theme === "oled";
  const hasUserManualAccess = entitled || purchased;
  const accountRequired = authReady && settingsReady && pathname === "/" && !signedIn;
  const setHeaderRef = useCallback((header: SharedHeaderElement | null) => {
    headerRef.current = header;
    if (!header) return;
    installUserManualAuthSkin(header);
    requestAnimationFrame(() => installUserManualAuthSkin(header));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const finish = () => {
      const platform = window.YWESharedComponents;
      const loading = platform?.loadingHeader ?? platform?.loading;
      return Promise.resolve(loading)
        .then(() => customElements.whenDefined("drsti-header"))
        .then(() => {
          if (active) setReady(true);
        });
    };
    if (customElements.get("drsti-header")) void finish();
    else {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${SHARED_COMPONENT_LOADER_URL}"]`);
      const script = existing ?? document.createElement("script");
      if (!existing) {
        script.src = SHARED_COMPONENT_LOADER_URL;
        script.defer = true;
        script.dataset.yweSharedLoader = "";
        document.head.appendChild(script);
      }
      if (existing?.dataset.loaded === "true") void finish();
      else script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        void finish();
      }, { once: true });
    }
    return () => { active = false; };
  }, [enabled]);

  useEffect(() => {
    if (!ready || !enabled) return;
    document.documentElement.dataset.yweSharedHeader = "";
    if (isDetailPage) document.documentElement.dataset.yweDetailHeader = "";
    return () => {
      delete document.documentElement.dataset.yweSharedHeader;
      delete document.documentElement.dataset.yweDetailHeader;
    };
  }, [enabled, isDetailPage, ready]);

  useEffect(() => {
    if (!ready || !enabled) return;
    const header = headerRef.current;
    if (!header) return;
    let frame = 0;
    const sync = () => {
      frame = 0;
      installUserManualAuthSkin(header);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(header.shadowRoot!, { childList: true, subtree: true });
    sync();
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled, pathname, ready]);

  useEffect(() => {
    if (!ready || !enabled) return;
    const cleanup = observeDirectionalTopChrome((hidden) => {
      headerRef.current?.classList.toggle("is-hidden", hidden);
    });
    return () => {
      cleanup();
      headerRef.current?.classList.remove("is-hidden");
    };
  }, [enabled, ready]);

  useEffect(() => {
    if (
      !ready ||
      !enabled ||
      process.env.NODE_ENV === "production" ||
      !devSimulateSignedIn
    ) return;

    const devProgressMode = normalizeDevProgressMode(
      document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${DEV_PROGRESS_COOKIE}=`))
        ?.split("=")[1],
    );
    const completedLevelCount = devCompletedLevelCount(devProgressMode, 0);
    const completedLevels = Array.from(
      { length: completedLevelCount },
      (_, index) => index + 1,
    );
    const authBridge = () => purchased ? "plus" as const : "no_sub" as const;
    const journeyBridge: SharedTutorialJourney = {
      signedIn: true,
      access: {
        completedLevels,
        entitled: purchased,
        levelProgress: completedLevels.map((level) => ({
          level_number: level,
          status: "completed",
        })),
      },
      profile: {
        welcomeCompletedAt: completedLevelCount > 0 ? 1 : null,
      },
      practices: [],
    };
    const previousAuth = window.drstiAuth;
    const previousJourney = window.drstiTutorialJourney;

    window.drstiAuth = authBridge;
    window.drstiTutorialJourney = journeyBridge;
    headerRef.current?.configure?.({});
    if (headerRef.current) {
      installUserManualAuthSkin(headerRef.current);
    }

    return () => {
      if (window.drstiAuth === authBridge) {
        if (previousAuth) window.drstiAuth = previousAuth;
        else delete window.drstiAuth;
      }
      if (window.drstiTutorialJourney === journeyBridge) {
        if (previousJourney) window.drstiTutorialJourney = previousJourney;
        else delete window.drstiTutorialJourney;
      }
      headerRef.current?.configure?.({});
    };
  }, [devSimulateSignedIn, enabled, pathname, purchased, ready]);

  useEffect(() => {
    if (!ready || !enabled) return;
    if (accountRequired) headerRef.current?.setAttribute("auth-required", "");
    else headerRef.current?.removeAttribute("auth-required");
    const shared = {
      active: "tutorial",
      userManualAccess: hasUserManualAccess,
      account: false,
      mobileBottom: false,
      tutorialPath: pathname,
      theme: isDark ? "dark" : "light",
    };
    const header = headerRef.current;
    header?.configure?.(isDetailPage ? {
      ...shared,
      preset: "immersive-detail",
      back: { mode: "href", href: "/" },
      actions: [],
      panels: {},
    } : {
      ...shared,
      preset: "immersive",
      actions: [{
        icon: "settings",
        label: "Settings",
        tip: "Settings",
        href: "#settings",
        event: "um:open-settings",
      }],
      panels: {},
    });
    if (header) {
      installUserManualAuthSkin(header);
    }
  }, [accountRequired, enabled, hasUserManualAccess, isDark, isDetailPage, pathname, ready, signedIn]);

  useEffect(() => {
    const syncTheme = (event: Event) => {
      const mode = (event as CustomEvent<{ mode?: string }>).detail?.mode;
      if (mode === "dark" || mode === "light") update({ theme: mode });
    };
    const syncThemeControl = () => {
      queueMicrotask(() => {
        const mode = document.documentElement.dataset.theme;
        if (mode === "dark" || mode === "light") update({ theme: mode });
      });
    };
    const themeControl = headerRef.current?.shadowRoot?.querySelector(".theme-switch");
    window.addEventListener("yweThemeChange", syncTheme);
    document.addEventListener("yweThemeChange", syncTheme);
    themeControl?.addEventListener("click", syncThemeControl);
    return () => {
      window.removeEventListener("yweThemeChange", syncTheme);
      document.removeEventListener("yweThemeChange", syncTheme);
      themeControl?.removeEventListener("click", syncThemeControl);
    };
  }, [ready, update]);

  useEffect(() => {
    const openAuth = (event: Event) => {
      const mode = (event as CustomEvent<{ mode?: string }>).detail?.mode === "signup"
        ? "signup"
        : "signin";
      const header = headerRef.current;
      const trigger = header?.shadowRoot?.querySelector<HTMLElement>(`[data-auth="${mode}"]`);
      trigger?.click();
    };
    window.addEventListener("yweOpenAuth", openAuth);
    return () => window.removeEventListener("yweOpenAuth", openAuth);
  }, []);

  if (!ready || !enabled) return null;

  return createElement("drsti-header", {
    active: "tutorial",
    "auth-required": accountRequired ? "" : undefined,
    "data-um-theme": isDark ? "dark" : "light",
    "detail-page": isDetailPage ? "" : undefined,
    ref: setHeaderRef,
    "user-manual-access": String(hasUserManualAccess),
  });
}
