import { notionLevelSections } from "./notion-levels.generated";
import {
  notionLevelOneFaqs,
  notionLevelOneSections,
} from "./notion-level-one.generated";

export interface TutorialSection {
  id: string;
  title: string;
  paragraphs: string[];
  checklist?: string[];
  footnotes?: TutorialInlineFootnote[];
}

export interface TutorialInlineFootnote {
  marker: string;
  text: string;
}

export interface TutorialChecklistItem {
  text: string;
  complete: boolean;
}

export interface TutorialFaq {
  question: string;
  answer: string;
}

export interface TutorialMediaBlock {
  id: string;
  captionTop?: string;
  captionBottom?: string;
}

export interface TutorialFootnote {
  id: string;
  text: string;
}

export interface TutorialTheme {
  accent: string;
  accentSoft: string;
  heroFrom: string;
  heroTo: string;
  surface: string;
  fonts: {
    heading: string;
    body: string;
  };
}

export interface TutorialLevel {
  level: number;
  title: string;
  subtitle: string;
  hero: string;
  vimeoId?: string;
  theme: TutorialTheme;
  sections: TutorialSection[];
  media: TutorialMediaBlock[];
  footnotes: TutorialFootnote[];
  checklist: TutorialChecklistItem[];
  faqs?: TutorialFaq[];
}

const levelThemes: TutorialTheme[] = [
  {
    accent: "#1E68B6",
    accentSoft: "#EDF4FF",
    heroFrom: "#78A9E5",
    heroTo: "#1E68B6",
    surface: "#F7F1EA",
    fonts: { heading: "var(--theme-font-heading)", body: "var(--font-dse-label)" },
  },
  {
    accent: "#3C59A6",
    accentSoft: "#EEF3FF",
    heroFrom: "#7D91D1",
    heroTo: "#3C59A6",
    surface: "#F7F1EA",
    fonts: { heading: "var(--theme-font-heading)", body: "var(--font-dse-label)" },
  },
  {
    accent: "#5B4A97",
    accentSoft: "#F1EEFF",
    heroFrom: "#8C80C9",
    heroTo: "#5B4A97",
    surface: "#F7F1EA",
    fonts: { heading: "var(--theme-font-heading)", body: "var(--font-dse-label)" },
  },
  {
    accent: "#793C87",
    accentSoft: "#F5ECF8",
    heroFrom: "#A977B2",
    heroTo: "#793C87",
    surface: "#F7F1EA",
    fonts: { heading: "var(--theme-font-heading)", body: "var(--font-dse-label)" },
  },
  {
    accent: "#982D78",
    accentSoft: "#F8EAF3",
    heroFrom: "#C06BA4",
    heroTo: "#982D78",
    surface: "#F7F1EA",
    fonts: { heading: "var(--theme-font-heading)", body: "var(--font-dse-label)" },
  },
  {
    accent: "#B61E68",
    accentSoft: "#FBE8F0",
    heroFrom: "#D7669C",
    heroTo: "#B61E68",
    surface: "#F7F1EA",
    fonts: { heading: "var(--theme-font-heading)", body: "var(--font-dse-label)" },
  },
];

function normalizeNotionSections(
  sections: TutorialSection[],
): TutorialSection[] {
  return sections.map((section) => {
    const paragraphs: string[] = [];

    for (const paragraph of section.paragraphs) {
      const isListItem = /^(?:[-*]\s+|\d+[.)]\s+)/.test(paragraph);
      const previous = paragraphs.at(-1);
      const previousIsList = previous
        ? /^(?:[-*]\s+|\d+[.)]\s+)/.test(previous)
        : false;

      if (isListItem && previousIsList) {
        paragraphs[paragraphs.length - 1] += `\n${paragraph}`;
      } else {
        paragraphs.push(paragraph);
      }
    }

    return { ...section, paragraphs };
  });
}

export const tutorials: TutorialLevel[] = [
  {
    level: 1,
    title: "level 1",
    subtitle: "upright & confident",
    hero: "deeper. slower. easier.",
    vimeoId: "000000000",
    theme: levelThemes[0],
    sections: notionLevelOneSections.map((section) => ({
      ...section,
      checklist: [...section.checklist],
      footnotes: section.footnotes.map((footnote) => ({ ...footnote })),
      paragraphs: [...section.paragraphs],
    })),
    media: [],
    footnotes: [],
    checklist: [],
    faqs: notionLevelOneFaqs.map((faq) => ({ ...faq })),
  },
  {
    level: 2,
    title: "level 2",
    subtitle: "grounded & aware",
    hero: "grounded. aware. steady.",
    vimeoId: "000000000",
    theme: levelThemes[1],
    sections: normalizeNotionSections(notionLevelSections[2]),
    media: [],
    footnotes: [],
    checklist: [
      { text: "You can return attention to your feet without bracing", complete: false },
      { text: "Your breath stays steady while your posture changes", complete: false },
      { text: "You can notice weight shifts without correcting too quickly", complete: false },
    ],
  },
  {
    level: 3,
    title: "level 3",
    subtitle: "breath & stillness",
    hero: "soft. quiet. clear.",
    vimeoId: "000000000",
    theme: levelThemes[2],
    sections: normalizeNotionSections(notionLevelSections[3]),
    media: [],
    footnotes: [],
    checklist: [
      { text: "You can stay relaxed through a full breath cycle", complete: false },
      { text: "You can identify unnecessary tension before releasing it", complete: false },
      { text: "You can pause without holding your breath", complete: false },
    ],
  },
  {
    level: 4,
    title: "level 4",
    subtitle: "strength & surrender",
    hero: "strong. soft. open.",
    vimeoId: "000000000",
    theme: levelThemes[3],
    sections: normalizeNotionSections(notionLevelSections[4]),
    media: [],
    footnotes: [],
    checklist: [
      { text: "You can create effort without hardening your breath", complete: false },
      { text: "You can release after contraction without collapsing", complete: false },
      { text: "You can distinguish strength from rigidity", complete: false },
    ],
  },
  {
    level: 5,
    title: "level 5",
    subtitle: "integration",
    hero: "connected. capable. calm.",
    vimeoId: "000000000",
    theme: levelThemes[4],
    sections: normalizeNotionSections(notionLevelSections[5]),
    media: [],
    footnotes: [],
    checklist: [
      { text: "You can carry the level work into a normal standing posture", complete: false },
      { text: "You can self-correct without overthinking", complete: false },
      { text: "You can keep breathing while coordinating multiple cues", complete: false },
    ],
  },
  {
    level: 6,
    title: "level 6",
    subtitle: "embodiment",
    hero: "clear. kind. alive.",
    vimeoId: "000000000",
    theme: levelThemes[5],
    sections: normalizeNotionSections(notionLevelSections[6]),
    media: [],
    footnotes: [],
    checklist: [
      { text: "You can feel the whole sequence as one connected pattern", complete: false },
      { text: "You can adapt the work to your body on a given day", complete: false },
      { text: "You can complete the practice without forcing the result", complete: false },
    ],
  },
];

export function getTutorial(level: string | number): TutorialLevel | undefined {
  const numericLevel = Number(level);
  return tutorials.find((tutorial) => tutorial.level === numericLevel);
}
