import { fontFamilies } from "@/theme/fonts";

interface NativeUniverseTheme {
  accent: string;
  accentSoft: string;
  badgeBackground: string;
  badgeInk: string;
  bodyFont: string | undefined;
  ink: string;
  mark: "atom" | "bolt" | "moon" | "mountain" | "sun";
  mood: string;
  surface: string;
  headingFont: string | undefined;
}

export const universeThemes: Record<string, NativeUniverseTheme> = {
  default: {
    accent: "#1E68B6",
    accentSoft: "#DDEBFA",
    badgeBackground: "#FFFFFF",
    badgeInk: "#1E68B6",
    bodyFont: fontFamilies.system,
    headingFont: fontFamilies.system,
    ink: "#142131",
    mark: "sun",
    mood: "Practice universe",
    surface: "#EDF4FF",
  },
  "wake-the-fck-up": {
    accent: "#F4BC33",
    accentSoft: "#FFE48A",
    badgeBackground: "#17130A",
    badgeInk: "#F4BC33",
    bodyFont: fontFamilies.alegreyaSans,
    headingFont: fontFamilies.lobster,
    ink: "#17130A",
    mark: "sun",
    mood: "Bright morning charge",
    surface: "#FFF8D7",
  },
  "prana-fusion": {
    accent: "#1D1160",
    accentSoft: "#D8CEFF",
    badgeBackground: "#1D1160",
    badgeInk: "#FFFFFF",
    bodyFont: fontFamilies.system,
    headingFont: fontFamilies.amaranth,
    ink: "#160B4F",
    mark: "bolt",
    mood: "Breath-led energy",
    surface: "#F0ECFF",
  },
  "yoga-reset": {
    accent: "#084A74",
    accentSoft: "#B9E4F8",
    badgeBackground: "#084A74",
    badgeInk: "#EAF7FC",
    bodyFont: fontFamilies.lexendDeca,
    headingFont: fontFamilies.lexendExa,
    ink: "#07364D",
    mark: "mountain",
    mood: "Nervous-system downshift",
    surface: "#EAF7FC",
  },
  "gravity-yoga": {
    accent: "#950301",
    accentSoft: "#F2B7B5",
    badgeBackground: "#950301",
    badgeInk: "#FFF0EF",
    bodyFont: fontFamilies.quicksand,
    headingFont: fontFamilies.quicksandBold,
    ink: "#4A0201",
    mark: "moon",
    mood: "Long-hold release",
    surface: "#FFF0EF",
  },
  "here-to-there": {
    accent: "#FF5757",
    accentSoft: "#FFC6C6",
    badgeBackground: "#4E1C1C",
    badgeInk: "#FFF1F1",
    bodyFont: fontFamilies.system,
    headingFont: fontFamilies.system,
    ink: "#4E1C1C",
    mark: "atom",
    mood: "State change ritual",
    surface: "#FFF1F1",
  },
};
