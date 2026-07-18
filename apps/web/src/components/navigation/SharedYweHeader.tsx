"use client";

import { createElement, useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/lib/settings/AuthContext";
import { useSettings } from "@/lib/settings/SettingsContext";

const SHARED_COMPONENT_LOADER_URL = "/shared-components/loader.js";
const USER_MANUAL_AUTH_STYLE_ID = "user-manual-auth-skin";
const USER_MANUAL_AUTH_STYLES = `
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

declare global {
  interface Window {
    YWESharedComponents?: SharedComponentPlatform;
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
  const { devSimulateSignedIn, ready: settingsReady, update } = useSettings();
  const headerRef = useRef<SharedHeaderElement | null>(null);
  const pathname = usePathname();
  const isDetailPage = /^\/(levels|universes)\//.test(pathname);
  const enabled = !pathname.startsWith("/ui-lab") && !isDetailPage;
  const signedIn = Boolean(user || devSimulateSignedIn);
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
    return () => {
      delete document.documentElement.dataset.yweSharedHeader;
    };
  }, [enabled, ready]);

  useEffect(() => {
    if (!ready || !enabled) return;
    const header = headerRef.current;
    if (!header) return;
    installUserManualAuthSkin(header);
    const frame = requestAnimationFrame(() => installUserManualAuthSkin(header));
    return () => cancelAnimationFrame(frame);
  }, [enabled, ready]);

  useEffect(() => {
    if (!ready || !enabled) return;
    if (accountRequired) headerRef.current?.setAttribute("auth-required", "");
    else headerRef.current?.removeAttribute("auth-required");
    headerRef.current?.configure?.({
      active: "tutorial",
      userManualAccess: entitled,
    });
  }, [accountRequired, enabled, entitled, ready, signedIn]);

  useEffect(() => {
    const syncTheme = (event: Event) => {
      const mode = (event as CustomEvent<{ mode?: string }>).detail?.mode;
      if (mode === "dark" || mode === "light") update({ theme: mode });
    };
    window.addEventListener("yweThemeChange", syncTheme);
    return () => window.removeEventListener("yweThemeChange", syncTheme);
  }, [update]);

  if (!ready || !enabled) return null;

  return createElement("drsti-header", {
    active: "tutorial",
    "auth-required": accountRequired ? "" : undefined,
    "hide-account": "",
    "hide-center": "",
    "hide-mobile-bottom": "",
    "hide-mobile-top": "",
    ref: setHeaderRef,
    "show-bar-mobile": "",
    "user-manual-access": String(entitled),
  });
}
