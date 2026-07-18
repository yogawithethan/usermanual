"use client";

import { useSettings } from "@/lib/settings/SettingsContext";
import { Icon } from "@/components/settings/icons";
import { LockedRow, PillGroup, Range, SectionLabel, ToggleRow } from "@/components/settings/SettingsPrimitives";

export function ReadingSettings({ onStartRsvp }: { onStartRsvp: () => void }) {
  const { scrollMode, bionicReading, rsvpWpm, purchased, accent, tokens, update } =
    useSettings();

  return (
    <div className="grid gap-6 px-4 py-4">
      <section>
        <SectionLabel>Flow</SectionLabel>
        <PillGroup
          value={scrollMode}
          onChange={(value) => update({ scrollMode: value })}
          options={[
            { value: "scroll", label: "Scroll" },
            { value: "page-turn", label: "Page-turn (soon)" },
          ]}
        />
      </section>

      <section>
        <SectionLabel>Accessibility</SectionLabel>
        <ToggleRow
          label="Bionic reading"
          description="Bold the first few letters of each word to create fixation points."
          value={bionicReading}
          onChange={(value) => update({ bionicReading: value })}
        />
      </section>

      <section>
        <SectionLabel>RSVP — Rapid serial presentation</SectionLabel>
        {purchased ? (
          <div className="grid gap-3">
            <p className="text-[12px] leading-[17px]" style={{ color: tokens.inkSecondary }}>
              Read one word at a time, centered on screen. Tap Begin, then tap any paragraph
              in the manual to start streaming from there.
            </p>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[12px] font-bold" style={{ color: tokens.inkSecondary }}>
                  Speed
                </span>
                <span className="text-[12px] font-bold" style={{ color: tokens.inkSecondary }}>
                  {rsvpWpm} wpm
                </span>
              </div>
              <Range min={200} max={800} step={25} value={rsvpWpm} onChange={(value) => update({ rsvpWpm: value })} />
            </div>
            <button
              type="button"
              onClick={onStartRsvp}
              className="shape-control flex items-center justify-center gap-2 px-4 py-3 text-[15px] font-bold text-white active:opacity-80"
              style={{ backgroundColor: accent }}
            >
              <Icon name="play" className="h-4 w-4" />
              Begin RSVP
            </button>
          </div>
        ) : (
          <LockedRow
            label="Rapid serial presentation"
            description="One word at a time, centered on screen."
          />
        )}
      </section>
    </div>
  );
}
