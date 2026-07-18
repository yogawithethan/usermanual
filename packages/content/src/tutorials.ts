import { notionLevelSections } from "./notion-levels.generated";

export interface TutorialSection {
  id: string;
  title: string;
  paragraphs: string[];
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

const levelOneSections: TutorialSection[] = [
  {
    id: "plunger-breathing",
    title: "Step #1: Plunger Breathing",
    paragraphs: [
      "Poor posture is caused by unnecessary muscular tension, weak core habits, incorrect positioning of the hips, mental stress, and injuries.",
      "Let's address the first factor on that list: tension. Flex your abs super tight. Contract, contract, contract. Now try to breathe into your belly.",
      "Impossible, right? Totally locked up. Muscular tension and breathing cannot coexist; they oppose and block one another.",
    ],
  },
  {
    id: "rib-breathing",
    title: "Step #2: Rib Breathing",
    paragraphs: [
      "Your ribcage is not a cage in the rigid sense. It is a movable structure that can expand in multiple directions.",
      "The goal is to feel breath spread into the front, sides, and back without lifting your shoulders or bracing your belly.",
    ],
  },
  {
    id: "syringe-breathing",
    title: "Step #3: Syringe Breathing",
    paragraphs: [
      "Your lungs can get pretty big, between 4.5L and 6L in the average adult.",
      "Even while completely exhaled, they still span from the bottom of your ribcage all the way up to your collarbones, then behind you into scapulae and traps.",
      "Imagine a syringe: someone places the needle in a cup of water and pulls the handle. The pressure differential causes liquid to be sucked into the tube.",
      "Now imagine this syringe handle overlayed onto your shoulder line. When you inhale, the syringe gets pulled and drags air into the top and backside of your lungs.",
    ],
  },
  {
    id: "pelvis-reset",
    title: "Step #4: Pelvis Reset",
    paragraphs: [
      "Breathing changes posture most reliably when the pelvis is no longer fighting the ribcage.",
      "Think of this as creating a steady base. The work is subtle, but once you feel it, everything above it gets easier.",
    ],
  },
  {
    id: "standing-integration",
    title: "Step #5: Standing Integration",
    paragraphs: [
      "Practice the same breathing pattern while standing. Keep your feet soft, your jaw relaxed, and your breath unforced.",
      "The test is whether you can maintain the expansion without becoming rigid.",
    ],
  },
  {
    id: "daily-practice",
    title: "Step #6: Daily Practice",
    paragraphs: [
      "Use this lesson for a few minutes at a time. Short, frequent practice works better than one heroic session.",
      "Only mark the level complete once the breathing pattern feels available without needing to think your way through every step.",
    ],
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
    sections: levelOneSections,
    media: [
      {
        id: "ribcage-placement",
        captionTop: "Hand on chest",
        captionBottom: "Hand on sides",
      },
    ],
    footnotes: [
      {
        id: "ribcage-heart",
        text: "Breathing with your ribcage also causes your heart to expand. When you inhale, your heart will speed up, and when you exhale, your heart will slow down. Levels 2 and 3 explore how you can use this to manually adjust your own blood pressure.",
      },
    ],
    checklist: [
      { text: "You can feel distinct movement in your ribcage during breathing", complete: true },
      { text: "Your ribs can expand in all directions during inhale", complete: true },
      { text: "You can maintain expansion without shoulder tension", complete: true },
      { text: "You notice your heart rate subtly changing with your breath cycle", complete: false },
    ],
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
