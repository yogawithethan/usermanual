export type UniverseStatus = "completed" | "in-progress" | "locked";

export interface PracticeUniverseTheme {
  primaryFont: string;
  secondaryFont: string;
  accent: string;
  surface: string;
  ink: string;
}

export interface PracticeUniverseSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface PracticeUniverse {
  title: string;
  subtitle: string;
  slug: string;
  icon: string;
  logo: string;
  logoClassName: string;
  unlockAfterLevel: number;
  color: string;
  textColor?: string;
  theme: PracticeUniverseTheme;
  sections: PracticeUniverseSection[];
}

const sideQuestSections: Record<string, PracticeUniverseSection[]> = {
  "wake-the-fck-up": [
    {
      id: "morning-orientation",
      title: "Morning Orientation",
      paragraphs: [
        "Wake The F*ck Up is built for the first few minutes of the day: simple, bright, and direct enough to use before your mind starts negotiating.",
        "The goal is not to force energy. The goal is to create enough movement, breath, and attention that the body naturally comes online.",
      ],
    },
    {
      id: "practice-approach",
      title: "Practice Approach",
      paragraphs: [
        "Keep the first round lighter than you think you need. Build heat gradually, then stop while the practice still feels useful.",
        "Use the videos as a short ritual rather than a performance. A consistent five minutes matters more than an occasional heroic session.",
      ],
    },
  ],
  "prana-fusion": [
    {
      id: "energy-and-control",
      title: "Energy And Control",
      paragraphs: [
        "Prāna Fusion is breath-led work for moving energy through the spine without losing steadiness.",
        "The central rule is control first, intensity second. If the breath gets sharp, rushed, or aggressive, reduce the effort until it becomes smooth again.",
      ],
    },
    {
      id: "spine-as-channel",
      title: "Spine As Channel",
      paragraphs: [
        "Treat the spine less like a rigid pole and more like a channel. Each practice should feel like breath, attention, and movement learning to travel together.",
      ],
    },
  ],
  "yoga-reset": [
    {
      id: "downshift",
      title: "Downshift",
      paragraphs: [
        "Yoga Reset is designed for returning to baseline when stress, fatigue, or emotional charge has pulled you out of your body.",
        "The practices should feel like a nervous-system exhale: slow enough to settle, structured enough to keep you engaged.",
      ],
    },
    {
      id: "aftercare",
      title: "Aftercare",
      paragraphs: [
        "Leave a little space after the practice before jumping back into stimulation. Notice whether your breath, jaw, shoulders, and eyes have softened.",
      ],
    },
  ],
  "gravity-yoga": [
    {
      id: "long-hold-principles",
      title: "Long-Hold Principles",
      paragraphs: [
        "Gravity Yoga uses time, support, and breath to create flexibility without forcing range.",
        "The sensation should be deep but sustainable. Sharp pain, nerve-like sensation, or bracing means the position is too intense.",
      ],
    },
    {
      id: "measuring-progress",
      title: "Measuring Progress",
      paragraphs: [
        "Progress is not only more range. It is also more calm inside the same range, less resistance on entry, and a cleaner recovery after the hold.",
      ],
    },
  ],
  "here-to-there": [
    {
      id: "state-change",
      title: "State Change",
      paragraphs: [
        "Here To There is for moving from one state to another without overwhelming the system.",
        "The practices are intentionally specific: choose the one that matches the transition you need, then let the structure carry you.",
      ],
    },
    {
      id: "integration",
      title: "Integration",
      paragraphs: [
        "After the practice, name the state you are leaving and the state you are entering. Keep it simple, physical, and immediate.",
      ],
    },
  ],
};

export const practiceUniverses: PracticeUniverse[] = [
  {
    title: "wake the f*ck up",
    subtitle: "Amazing mornings, naturally.",
    slug: "wake-the-fck-up",
    icon: "/tutorial-icons/wtfu-sun-icon.svg",
    logo: "/tutorial-icons/wtfu-title.svg",
    logoClassName: "h-[72px] w-[118px]",
    unlockAfterLevel: 1,
    color: "#F4BC33",
    theme: {
      primaryFont: "var(--font-wtfu-primary)",
      secondaryFont: "var(--font-wtfu-secondary)",
      accent: "#F4BC33",
      surface: "#FFF8D7",
      ink: "#17130A",
    },
    sections: sideQuestSections["wake-the-fck-up"],
  },
  {
    title: "prāna fusion",
    subtitle: "Upgraded nervous system.",
    slug: "prana-fusion",
    icon: "/tutorial-icons/pf-lightning-icon.svg",
    logo: "/tutorial-icons/prana-fusion-title.svg",
    logoClassName: "h-[58px] w-[124px]",
    unlockAfterLevel: 2,
    color: "#1D1160",
    theme: {
      primaryFont: "var(--font-prana-primary)",
      secondaryFont: "\"Nexa\", var(--font-dse-poppins), sans-serif",
      accent: "#1D1160",
      surface: "#F0ECFF",
      ink: "#160B4F",
    },
    sections: sideQuestSections["prana-fusion"],
  },
  {
    title: "yoga reset",
    subtitle: "Stress → relief.",
    slug: "yoga-reset",
    icon: "/tutorial-icons/yr-mountain-icon.svg",
    logo: "/tutorial-icons/yoga-reset-title.svg",
    logoClassName: "h-[44px] w-[180px]",
    unlockAfterLevel: 3,
    color: "#084A74",
    theme: {
      primaryFont: "var(--font-yoga-reset-primary)",
      secondaryFont: "var(--font-yoga-reset-secondary)",
      accent: "#084A74",
      surface: "#EAF7FC",
      ink: "#07364D",
    },
    sections: sideQuestSections["yoga-reset"],
  },
  {
    title: "gravity yoga",
    subtitle: "Really flexible, really quickly.",
    slug: "gravity-yoga",
    icon: "/tutorial-icons/gy-moon-icon.svg",
    logo: "/tutorial-icons/gravity-yoga-title.svg",
    logoClassName: "h-[56px] w-[128px]",
    unlockAfterLevel: 4,
    color: "#950301",
    theme: {
      primaryFont: "var(--font-gravity-primary)",
      secondaryFont: "var(--font-gravity-primary)",
      accent: "#950301",
      surface: "#FFF0EF",
      ink: "#4A0201",
    },
    sections: sideQuestSections["gravity-yoga"],
  },
  {
    title: "here to there",
    subtitle: "Trauma release.",
    slug: "here-to-there",
    icon: "/tutorial-icons/h2t-atom-icon.svg",
    logo: "/tutorial-icons/here-to-there-title.svg",
    logoClassName: "h-[58px] w-[106px]",
    unlockAfterLevel: 5,
    color: "#FF5757",
    theme: {
      primaryFont: "\"Bubblebody Neu\", var(--font-dse-heading), sans-serif",
      secondaryFont: "\"Nexa\", var(--font-dse-poppins), sans-serif",
      accent: "#FF5757",
      surface: "#FFF1F1",
      ink: "#4E1C1C",
    },
    sections: sideQuestSections["here-to-there"],
  },
];

export function getPracticeUniverse(slug: string): PracticeUniverse | undefined {
  return practiceUniverses.find((universe) => universe.slug === slug);
}
