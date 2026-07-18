"use client";

import type { SkipInterval, SleepTimer } from "@/lib/settings/SettingsContext";
import { useSettings } from "@/lib/settings/SettingsContext";
import { LockedRow, PillGroup, SectionLabel } from "@/components/settings/SettingsPrimitives";

const SLEEP_OPTIONS: { value: SleepTimer; label: string }[] = [
  { value: null, label: "Off" },
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hour" },
  { value: "end", label: "End of chapter" },
];

const SKIP_OPTIONS: { value: SkipInterval; label: string }[] = [
  { value: 10, label: "10s" },
  { value: 15, label: "15s" },
  { value: 30, label: "30s" },
  { value: 45, label: "45s" },
];

export function AudioSettings() {
  const { sleepTimer, skipInterval, update, tokens } = useSettings();

  return (
    <div className="grid gap-6 px-4 py-4">
      <div className="shape-card px-3 py-2" style={{ backgroundColor: tokens.bgSoft }}>
        <p className="text-[12px] leading-5" style={{ color: tokens.inkSecondary }}>
          Narration coming soon — these settings will activate when audio ships.
        </p>
      </div>
      <section>
        <SectionLabel>Narration</SectionLabel>
        <LockedRow label="Karaoke highlighting" description="Highlight each word as it's narrated." />
        <LockedRow
          label="Auto-scroll with audio"
          description="Keep the current word centered as narration plays."
        />
      </section>
      <section>
        <SectionLabel>Sleep timer</SectionLabel>
        <PillGroup value={sleepTimer} onChange={(value) => update({ sleepTimer: value })} options={SLEEP_OPTIONS} wrap />
      </section>
      <section>
        <SectionLabel>Skip interval</SectionLabel>
        <PillGroup
          value={skipInterval}
          onChange={(value) => update({ skipInterval: value })}
          options={SKIP_OPTIONS}
          columns={4}
        />
      </section>
    </div>
  );
}
