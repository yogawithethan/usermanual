"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/settings/AuthContext";
import { DEV_PROGRESS_COOKIE, type DevProgressMode } from "@/lib/dev-progress";
import { useSettings } from "@/lib/settings/SettingsContext";
import { withAlpha } from "@/lib/settings/theme";
import { Icon } from "@/components/settings/icons";
import { AuthForm } from "@/components/settings/AuthForm";
import type { IslandsInfo } from "@/components/settings/IslandsWordmark";
import { PillGroup, SectionLabel, ToggleRow } from "@/components/settings/SettingsPrimitives";

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

export function ProfileSettings({
  authOpenTrigger = 0,
  islandsInfo,
}: {
  authOpenTrigger?: number;
  islandsInfo: IslandsInfo;
}) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { tokens, accent, purchased, licenseEmail, devSimulateSignedIn, update } =
    useSettings();
  const [authOpen, setAuthOpen] = useState(false);
  const [devProgressMode, setDevProgressMode] = useState<DevProgressMode>("real");
  const seenTrigger = useRef(authOpenTrigger);

  useEffect(() => {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${DEV_PROGRESS_COOKIE}=`));
    const value = match?.split("=")[1];
    setDevProgressMode(value === "half" || value === "all" ? value : "real");
  }, []);

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

  const applyDevProgress = (nextMode: DevProgressMode) => {
    const maxAge = nextMode === "real" ? 0 : 60 * 60 * 24 * 7;
    document.cookie = `${DEV_PROGRESS_COOKIE}=${nextMode}; path=/; max-age=${maxAge}; samesite=lax`;
    setDevProgressMode(nextMode);
    router.refresh();
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
              <span className="text-[15px] font-bold">Sign in</span>
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

      <section>
        <SectionLabel>Access (preview)</SectionLabel>
        <ToggleRow
          label="Premium unlocked"
          description="Simulates a paid Yoga With Ethan account."
          value={purchased}
          onChange={(value) => update({ purchased: value })}
        />
        <ToggleRow
          label="Pretend signed-in"
          description="Dev only: shows the signed-in state without requesting an email link."
          value={devSimulateSignedIn}
          onChange={(value) => update({ devSimulateSignedIn: value })}
        />
        <button
          type="button"
          onClick={() => update({ firstLaunched: false })}
          className="shape-card mt-2 flex w-full items-center justify-between px-4 py-3 text-left active:opacity-70"
          style={{ border: `1px solid ${tokens.pillBorder}` }}
        >
          <span className="min-w-0 flex-1 pr-3">
            <span className="block text-[15px] font-bold" style={{ color: tokens.ink }}>
              Replay first-launch onboarding
            </span>
            <span className="mt-0.5 block text-[12px] leading-4" style={{ color: tokens.inkTertiary }}>
              Dev only: shows the cold-open flow as if it&apos;s the first time.
            </span>
          </span>
          <Icon name="play" className="h-4 w-4" />
        </button>
        <div className="mt-5">
          <SectionLabel>Dev progress</SectionLabel>
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
        </div>
      </section>

      <p className="text-center text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: tokens.inkTertiary }}>
        Yoga With Ethan account
      </p>
    </div>
  );
}
