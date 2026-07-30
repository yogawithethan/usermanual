import type { PracticeUniverse } from "@islands/content";

import { MarkdownContent } from "@/components/tutorials/MarkdownContent";
import { AssociatedPractices, type AssociatedPractice } from "./AssociatedPractices";
import { ChapterNavigator } from "./ChapterNavigator";
import {
  DetailArticle,
  DetailExperience,
  DetailHero,
  DetailSection,
  DetailVideo,
} from "./DetailExperience";
import { InteractiveChecklist } from "./InteractiveChecklist";

export interface UniverseDetailSection {
  id: string;
  paragraphs: string[];
  title: string;
}

const UNIVERSE_MASTERY_CHECKLISTS: Record<string, string[]> = {
  "wake-the-fck-up": [
    "Name your honest starting state and choose the feeling you want to cultivate.",
    "Use breath, movement, and attention together until you can feel your energy change.",
    "Finish by noticing the fruit of the practice and setting a clear direction for the day.",
    "Use at least one morning tool—Yessing, Liver Flush, Sun-Gazing, Strike a Pose, or Diamond Mining—without forcing it.",
    "Complete a morning session that leaves you clearer rather than depleted.",
  ],
  "prana-fusion": [
    "Meter your energy before and after practice and describe what changed.",
    "Create a steady Grid Lock without gripping your jaw, throat, or breath.",
    "Use Circuit Breaker when effort becomes sharp, rushed, or overwhelming.",
    "Direct sensation with Pinging, Radiating, or Lifting while keeping the spine spacious.",
    "Recognize the safety signals that mean it is time to reduce intensity or stop.",
  ],
  "yoga-reset": [
    "Recognize whether you are in a peak, a valley, or close to your baseline.",
    "Choose a river or stream-sized intervention that matches the intensity of your state.",
    "Use the Eastern Star to orient your attention through the whole body.",
    "Check your nasal cycle and choose a balancing breath without forcing airflow.",
    "Notice a measurable downshift in breath, jaw, shoulders, eyes, or thought speed.",
  ],
  "gravity-yoga": [
    "Distinguish a deep, sustainable stretch from sharp, nerve-like, or bracing pain.",
    "Set up a supported long hold that you can exit slowly and under control.",
    "Maintain quiet Lunar Breathing instead of holding or forcing the breath.",
    "Use Pinging, Target, or Scrub to locate and work with a specific restriction.",
    "Measure progress by calm, ease of entry, and recovery—not range alone.",
  ],
  "here-to-there": [
    "Name the state you are leaving and the state you want to enter.",
    "Practice Radical Acceptance before trying to force a change.",
    "Build will-power without flooding, dissociating, or overriding safety signals.",
    "Use Safe Breathing or another breath hack appropriate to your present state.",
    "Pause after the practice and confirm that the new state feels integrated and usable.",
  ],
};

export function UniverseDetail({
  practices,
  sections,
  universe,
}: {
  practices: AssociatedPractice[];
  sections: UniverseDetailSection[];
  universe: PracticeUniverse;
}) {
  const theme = getUniverseDetailTheme(universe);
  const chapters = [
    { id: "video", kind: "video" as const, label: "Video" },
    ...sections.map((section) => ({ id: section.id, label: section.title })),
    { id: "checklist", label: "Master checklist" },
    { id: "practices", kind: "practice" as const, label: "Practices" },
  ];
  const checklist = (UNIVERSE_MASTERY_CHECKLISTS[universe.slug] ?? []).map((text) => ({ text, complete: false }));

  return (
    <DetailExperience theme={theme} transitionName={`detail-universe-${universe.slug}`}>
      <DetailHero
        atmosphere="still"
        icon={universe.icon}
        logo={universe.logo}
        subtitle={universe.subtitle}
        title={universe.title}
        universeSlug={universe.slug}
      />
      <ChapterNavigator chapters={chapters} />
      <DetailArticle>
        <DetailVideo />
        {sections.map((section) => (
          <DetailSection key={section.id} id={section.id} title={section.title}>
            <MarkdownContent blocks={section.paragraphs} />
          </DetailSection>
        ))}
        <InteractiveChecklist items={checklist} storageKey={`universe-${universe.slug}`} />
        <AssociatedPractices practices={practices} />
      </DetailArticle>
    </DetailExperience>
  );
}

export function getUniverseDetailTheme(universe: PracticeUniverse) {
  return {
    accent: universe.theme.accent,
    accentSoft: universe.theme.surface,
    bodyFont: universe.theme.secondaryFont,
    headingFont: universe.theme.primaryFont,
    heroFrom: colorMix(universe.theme.accent, "#ffffff", 22),
    heroTo: universe.color,
    ink: universe.theme.ink,
    surface: universe.theme.surface,
  };
}

function colorMix(color: string, white: string, amount: number) {
  const normalize = (value: string) => value.replace("#", "");
  const from = normalize(color);
  const to = normalize(white);
  if (from.length !== 6 || to.length !== 6) return color;
  const ratio = Math.max(0, Math.min(100, amount)) / 100;
  const channels = [0, 2, 4].map((index) => {
    const start = Number.parseInt(from.slice(index, index + 2), 16);
    const end = Number.parseInt(to.slice(index, index + 2), 16);
    return Math.round(start + (end - start) * ratio).toString(16).padStart(2, "0");
  });
  return `#${channels.join("")}`;
}
