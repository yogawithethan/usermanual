import type { PracticeUniverse } from "@islands/content";

import { MarkdownContent } from "@/components/tutorials/MarkdownContent";
import { AssociatedPractices, type AssociatedPractice } from "./AssociatedPractices";
import { ChapterNavigator } from "./ChapterNavigator";
import {
  DetailArticle,
  DetailBackLink,
  DetailExperience,
  DetailHero,
  DetailSection,
  DetailVideo,
  detailStyles,
} from "./DetailExperience";
import { InteractiveChecklist } from "./InteractiveChecklist";

export interface UniverseDetailSection {
  id: string;
  paragraphs: string[];
  title: string;
}

export function UniverseDetail({
  completeAction,
  completed,
  practices,
  sections,
  universe,
}: {
  completeAction: (formData: FormData) => void | Promise<void>;
  completed: boolean;
  practices: AssociatedPractice[];
  sections: UniverseDetailSection[];
  universe: PracticeUniverse;
}) {
  const theme = getUniverseDetailTheme(universe);
  const chapters = [
    { id: "video", label: "Core film" },
    ...sections.map((section) => ({ id: section.id, label: section.title })),
    { id: "practices", label: "Practices" },
    { id: "complete", label: "Complete" },
  ];
  const checklist = sections.map((section) => ({ text: `Read and reflect on ${section.title}`, complete: false }));

  return (
    <DetailExperience theme={theme} transitionName={`detail-universe-${universe.slug}`}>
      <DetailBackLink label="Back to The User Manual" />
      <DetailHero
        atmosphere={universe.slug === "prana-fusion" ? "lightning" : universe.slug === "gravity-yoga" ? "still" : "clouds"}
        eyebrow="Practice world"
        icon={universe.icon}
        logo={universe.logo}
        subtitle={universe.subtitle}
        title={universe.title}
      />
      <ChapterNavigator chapters={chapters} />
      <DetailArticle>
        <DetailVideo />
        {sections.map((section) => (
          <DetailSection key={section.id} id={section.id} title={section.title}>
            <MarkdownContent blocks={section.paragraphs} />
          </DetailSection>
        ))}
        <AssociatedPractices practices={practices} />
        <InteractiveChecklist items={checklist} storageKey={`universe-${universe.slug}`} />
        <section id="complete" className={`${detailStyles.section} ${detailStyles.completeZone}`}>
          <p>{completed ? "This tutorial is complete. You can reopen it without losing access." : "Mark this tutorial complete when it feels complete to you. The checklist is optional."}</p>
          <form action={completeAction}>
            <input type="hidden" name="slug" value={universe.slug} />
            <input type="hidden" name="complete" value={completed ? "0" : "1"} />
            <button type="submit">{completed ? "Mark incomplete" : "Complete tutorial"}</button>
          </form>
        </section>
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
