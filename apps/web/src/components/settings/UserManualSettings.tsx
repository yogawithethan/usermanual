"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthForm } from "@/components/settings/AuthForm";
import type { IslandsInfo } from "@/components/settings/IslandsWordmark";
import { Icon } from "@/components/settings/icons";
import {
  PillGroup,
  SectionLabel,
  ToggleRow,
} from "@/components/settings/SettingsPrimitives";
import {
  DEV_AUTH_COOKIE,
  DEV_PREMIUM_COOKIE,
  DEV_PROGRESS_COOKIE,
  type DevProgressMode,
} from "@/lib/dev-progress";
import { useAuth } from "@/lib/settings/AuthContext";
import { useSettings, type HomeOrder } from "@/lib/settings/SettingsContext";
import { withAlpha, type ThemeId } from "@/lib/settings/theme";

type UserManualSettingsTab = "home" | "appearance" | "account" | "developer";

function nameFromEmail(email: string): string {
  const handle = email.split("@")[0] ?? "";
  return (
    handle
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") || "Member"
  );
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "").concat(parts[1]?.[0] ?? "").toUpperCase() || "·";
}

export function UserManualSettings({
  tab,
  authOpenTrigger = 0,
  islandsInfo,
}: {
  tab: UserManualSettingsTab;
  authOpenTrigger?: number;
  islandsInfo: IslandsInfo;
}) {
  if (tab === "home") return <HomeSettings />;
  if (tab === "appearance") return <AppearanceSettings />;
  if (tab === "developer") return <DeveloperSettings />;
  return <AccountSettings authOpenTrigger={authOpenTrigger} islandsInfo={islandsInfo} />;
}

function HomeSettings() {
  const { tokens, homeOrder, update } = useSettings();

  return (
    <div className="grid gap-6 px-4 py-4">
      <section>
        <SectionLabel>Home screen</SectionLabel>
        <PillGroup<HomeOrder>
          value={homeOrder}
          onChange={(value) => update({ homeOrder: value })}
          options={[
            { value: "levels-first", label: "Levels first", icon: <LevelsFirstIcon /> },
            { value: "journey", label: "Journey order", icon: <JourneyOrderIcon /> },
          ]}
          columns={2}
        />
        <div
          className="shape-card mt-3 px-4 py-3 text-[13px] leading-5"
          style={{
            backgroundColor: tokens.bgSoft,
            color: tokens.inkSecondary,
          }}
        >
          {homeOrder === "levels-first"
            ? "Shows Level 1-6 first, then the side tutorials."
            : "Interleaves side tutorials after the level that unlocks them."}
        </div>
      </section>

      <section>
        <SectionLabel>Start Here</SectionLabel>
        <Link
          href="/welcome"
          className="shape-card flex w-full items-center justify-between px-4 py-3 text-left active:opacity-70"
          style={{ border: `1px solid ${tokens.pillBorder}`, color: tokens.ink }}
        >
          <span className="text-[15px] font-bold">Revisit Start Here</span>
          <Icon name="play" className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

function LevelsFirstIcon() {
  return <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" /></svg>;
}

function JourneyOrderIcon() {
  return <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" /></svg>;
}

function AppearanceSettings() {
  const { theme, update } = useSettings();

  return (
    <div className="grid gap-6 px-4 py-4">
      <section>
        <SectionLabel>Appearance</SectionLabel>
        <PillGroup<ThemeId>
          value={theme === "dark" ? "dark" : "light"}
          onChange={(value) => update({ theme: value })}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
          columns={2}
        />
      </section>
    </div>
  );
}

function AccountSettings({
  authOpenTrigger = 0,
  islandsInfo,
}: {
  authOpenTrigger?: number;
  islandsInfo: IslandsInfo;
}) {
  const { user, signOut } = useAuth();
  const { tokens, accent, purchased, licenseEmail, devSimulateSignedIn, update } =
    useSettings();
  const [authOpen, setAuthOpen] = useState(false);
  const seenTrigger = useRef(authOpenTrigger);

  useEffect(() => {
    if (authOpenTrigger !== seenTrigger.current) {
      seenTrigger.current = authOpenTrigger;
      if (!user) setAuthOpen(true);
    }
  }, [authOpenTrigger, user]);

  const isAuthed = Boolean(user) || purchased || devSimulateSignedIn;
  const email = user?.email ?? licenseEmail ?? "";
  const name = email ? nameFromEmail(email) : "Member";

  const handleSignOut = async () => {
    if (user) await signOut();
    update({ purchased: false, licenseEmail: null, devSimulateSignedIn: false });
  };

  return (
    <div className="grid gap-6 px-4 py-4">
      <section>
        <SectionLabel>Account</SectionLabel>
        {isAuthed ? (
          <>
            <div className="shape-card px-4 py-4" style={{ backgroundColor: tokens.bgSoft }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: withAlpha(accent, 0.18),
                    border: `1px solid ${withAlpha(accent, 0.3)}`,
                    color: accent,
                  }}
                >
                  <span className="text-[16px] font-bold">{initials(name)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-bold" style={{ color: tokens.ink }}>
                    {name}
                  </p>
                  {email ? (
                    <p className="mt-0.5 truncate text-[12px]" style={{ color: tokens.inkTertiary }}>
                      {email}
                    </p>
                  ) : null}
                </div>
                {purchased ? (
                  <span
                    className="shape-control px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em]"
                    style={{
                      backgroundColor: withAlpha(accent, 0.15),
                      border: `1px solid ${withAlpha(accent, 0.35)}`,
                      color: accent,
                    }}
                  >
                    Premium
                  </span>
                ) : null}
              </div>
            </div>
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={handleSignOut}
                className="shape-control inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold active:opacity-70"
                style={{ border: `1px solid ${tokens.pillBorder}`, color: tokens.inkSecondary }}
              >
                <Icon name="logout" className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setAuthOpen((value) => !value)}
              className="shape-card flex w-full items-center justify-between px-4 py-4 text-left active:opacity-70"
              style={{ border: `1px solid ${tokens.pillBorder}`, color: tokens.ink }}
            >
              <span className="text-[15px] font-bold">Log in or sign up</span>
              <Icon
                name="chevron"
                className={["h-4 w-4 transition-transform", authOpen ? "rotate-90" : ""].join(" ")}
              />
            </button>
            <div
              className="grid transition-[grid-template-rows,opacity] duration-200"
              style={{
                gridTemplateRows: authOpen ? "1fr" : "0fr",
                opacity: authOpen ? 1 : 0,
              }}
            >
              <div className="overflow-hidden">
                {authOpen ? <AuthForm onSuccess={() => setAuthOpen(false)} /> : null}
              </div>
            </div>
          </>
        )}
      </section>

      <p className="text-center text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: tokens.inkTertiary }}>
        Yoga With Ethan account
      </p>
    </div>
  );
}

function DeveloperSettings() {
  const router = useRouter();
  const { purchased, devSimulateSignedIn, tokens, update } = useSettings();
  const [devProgressMode, setDevProgressMode] = useState<DevProgressMode>("real");

  useEffect(() => {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${DEV_PROGRESS_COOKIE}=`));
    const value = match?.split("=")[1];
    setDevProgressMode(value === "half" || value === "all" ? value : "real");
  }, []);

  const applyDevProgress = (nextMode: DevProgressMode) => {
    const maxAge = nextMode === "real" ? 0 : 60 * 60 * 24 * 7;
    document.cookie = `${DEV_PROGRESS_COOKIE}=${nextMode}; path=/; max-age=${maxAge}; samesite=lax`;
    setDevProgressMode(nextMode);
    router.refresh();
  };

  const applyAccessPreview = (cookie: string, value: boolean) => {
    const maxAge = value ? 60 * 60 * 24 * 7 : 0;
    document.cookie = `${cookie}=${value ? "1" : ""}; path=/; max-age=${maxAge}; samesite=lax`;
    router.refresh();
  };

  const unlockEverything = () => {
    const maxAge = 60 * 60 * 24 * 7;
    update({ purchased: true, devSimulateSignedIn: true });
    setDevProgressMode("all");
    document.cookie = `${DEV_PREMIUM_COOKIE}=1; path=/; max-age=${maxAge}; samesite=lax`;
    document.cookie = `${DEV_AUTH_COOKIE}=1; path=/; max-age=${maxAge}; samesite=lax`;
    document.cookie = `${DEV_PROGRESS_COOKIE}=all; path=/; max-age=${maxAge}; samesite=lax`;
    router.refresh();
  };

  return (
    <div className="grid gap-6 px-4 py-4">
      <button
        type="button"
        onClick={unlockEverything}
        className="shape-card flex w-full items-center justify-between px-4 py-3 text-left active:opacity-70"
        style={{
          backgroundColor: tokens.bgSoft,
          border: `1px solid ${tokens.pillBorder}`,
          color: tokens.ink,
        }}
      >
        <span>
          <span className="block text-[15px] font-bold">Unlock everything</span>
          <span className="mt-0.5 block text-[12px] opacity-60">
            Opens every detail page for local editing.
          </span>
        </span>
        <Icon name="lock" className="h-4 w-4" />
      </button>

      <section>
        <SectionLabel>Access preview</SectionLabel>
        <ToggleRow
          label="Premium unlocked"
          value={purchased}
          onChange={(value) => {
            update({ purchased: value });
            applyAccessPreview(DEV_PREMIUM_COOKIE, value);
          }}
        />
        <ToggleRow
          label="Pretend signed-in"
          value={devSimulateSignedIn}
          onChange={(value) => {
            update({ devSimulateSignedIn: value });
            applyAccessPreview(DEV_AUTH_COOKIE, value);
          }}
        />
      </section>

      <section>
        <SectionLabel>Progress preview</SectionLabel>
        <PillGroup
          value={devProgressMode}
          onChange={applyDevProgress}
          options={[
            { value: "real", label: "Real" },
            { value: "half", label: "Half" },
            { value: "all", label: "All" },
          ]}
          columns={3}
        />
      </section>
    </div>
  );
}
