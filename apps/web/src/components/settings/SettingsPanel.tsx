"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { GraduationCap, User } from "@phosphor-icons/react";

import { Icon } from "@/components/settings/icons";
import type { IslandsInfo } from "@/components/settings/IslandsWordmark";
import { UserManualSettings } from "@/components/settings/UserManualSettings";
import floatingStyles from "@/components/ui/FloatingControl.module.css";
import { useDirectionalTopChrome } from "@/components/ui/useDirectionalTopChrome";
import { useSettings } from "@/lib/settings/SettingsContext";
import styles from "./SettingsPanel.module.css";

type Tab = "home" | "account" | "developer";

const TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "account", label: "Account" },
  { id: "developer", label: "Dev" },
];

export function SettingsPanel({
  initialTab = "home",
  authOpenTrigger = 0,
  islandsInfo,
}: {
  initialTab?: Tab;
  authOpenTrigger?: number;
  islandsInfo: IslandsInfo;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const { tokens } = useSettings();
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const measure = () => setContentHeight(node.getBoundingClientRect().height);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [tab]);

  return (
    <div>
      <div className="px-4 pt-4">
        <SettingsTabs tab={tab} onChange={setTab} />
      </div>
      <div
        className="settings-height-shell overflow-hidden transition-[height] duration-300 ease-out"
        style={{ height: contentHeight ?? "auto" }}
      >
        <div
          ref={contentRef}
          className={`${styles.content} max-h-[min(62vh,560px)] overflow-y-auto pb-2`}
        >
          <UserManualSettings
            tab={tab}
            authOpenTrigger={authOpenTrigger}
            islandsInfo={islandsInfo}
          />
        </div>
      </div>
    </div>
  );
}

function SettingsTabs({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  const { tokens } = useSettings();
  const activeIndex = TABS.findIndex((item) => item.id === tab);

  return (
    <div
      className={`${styles.tabRail} relative h-[52px] p-1`}
      style={{ "--active-tab": activeIndex } as CSSProperties}
    >
      <span className={styles.tabSlider} aria-hidden />
      <div className="relative z-10 grid h-full grid-cols-3 gap-1">
        {TABS.map((item) => {
          const active = item.id === tab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`${styles.tabButton} flex items-center justify-center gap-2 text-[11px] font-bold transition-colors`}
              data-active={active || undefined}
              style={{ color: active ? tokens.ink : tokens.inkTertiary }}
            >
              <SettingsTabIcon tab={item.id} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SettingsLauncher({ islandsInfo, showLauncher = true }: { islandsInfo: IslandsInfo; showLauncher?: boolean }) {
  const [open, setOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<Tab>("home");
  const [authOpenTrigger, setAuthOpenTrigger] = useState(0);
  const { tokens } = useSettings();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const chromeHidden = useDirectionalTopChrome({ enabled: showLauncher, forceVisible: open });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    const openFromNavigation = () => openPanel("home");
    document.addEventListener("um:open-settings", openFromNavigation);
    return () => document.removeEventListener("um:open-settings", openFromNavigation);
  });

  useEffect(() => {
    document.documentElement.toggleAttribute("data-settings-open", open);

    return () => {
      document.documentElement.removeAttribute("data-settings-open");
    };
  }, [open]);

  const openPanel = (tab: Tab) => {
    setInitialTab(tab);
    if (tab === "account") setAuthOpenTrigger((value) => value + 1);
    setOpen(true);
  };

  return (
    <>
      {showLauncher ? <div data-settings-launcher className={`${styles.launcherDock} ${chromeHidden ? styles.launcherDockHidden : ""}`}>
        <button
          type="button"
          aria-label="Open settings"
          aria-expanded={open}
          onClick={() => openPanel("home")}
          className={`${floatingStyles.control} ${styles.launcherButton}`}
        >
          <SettingsGearIcon className="h-[19px] w-[19px]" />
        </button>
      </div> : null}

      {open ? (
        <div className="fixed inset-0 z-[20020] flex items-end justify-center px-4 pb-5 pt-16 sm:items-center sm:py-8">
          <button
            type="button"
            aria-label="Close settings"
            className={`${styles.backdrop} absolute inset-0`}
            onClick={() => setOpen(false)}
          />
          <section
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`${styles.panel} app-chrome relative w-full max-w-[460px] overflow-hidden`}
            style={{
              color: tokens.ink,
            }}
          >
            <div className={`${styles.header} flex items-center justify-between px-5 pt-5`}>
              <div>
                <h2 id={titleId} className="app-display text-[25px] font-bold leading-none">
                  Settings
                </h2>
                <p className="mt-1 text-[12px] font-bold" style={{ color: tokens.inkTertiary }}>
                  The User Manual
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Close settings"
                  onClick={() => setOpen(false)}
                  className={`${styles.closeButton} flex h-9 w-9 items-center justify-center rounded-full`}
                  style={{ color: tokens.inkSecondary }}
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </div>
            </div>
            <SettingsPanel
              initialTab={initialTab}
              authOpenTrigger={authOpenTrigger}
              islandsInfo={islandsInfo}
            />
            <div className={styles.prismLine} />
          </section>
        </div>
      ) : null}
    </>
  );
}

function SettingsTabIcon({ tab }: { tab: Tab }) {
  if (tab === "home") return <GraduationCap aria-hidden size={21} weight="regular" />;
  if (tab === "account") return <User aria-hidden size={21} weight="regular" />;
  return <SettingsGearIcon className="h-[21px] w-[21px]" />;
}

function SettingsGearIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}
