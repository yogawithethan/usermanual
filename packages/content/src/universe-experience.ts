export type PracticeKind = "audio" | "breathwork" | "flexibility" | "hatha-yoga" | "meditation";
export type PracticeIntensity = "gentle" | "moderate" | "strong";
export type ReleaseStatus = "available" | "coming_soon";

export interface UniversePractice {
  bodyArea: string;
  description: string;
  durationMinutes: number;
  goal: string;
  id: string;
  intensity: PracticeIntensity;
  kind: PracticeKind;
  releaseStatus: ReleaseStatus;
  title: string;
  universeSlug: string;
}

export interface UniverseDownload {
  fileType: "PDF" | "ZIP" | "MP3";
  id: string;
  releaseStatus: ReleaseStatus;
  revision: string;
  sizeLabel: string;
  title: string;
  universeSlug: string;
}

const practice = (
  universeSlug: string,
  id: string,
  title: string,
  durationMinutes: number,
  kind: PracticeKind,
  goal: string,
  bodyArea: string,
  intensity: PracticeIntensity,
  description: string,
): UniversePractice => ({
  bodyArea,
  description,
  durationMinutes,
  goal,
  id,
  intensity,
  kind,
  releaseStatus: "coming_soon",
  title,
  universeSlug,
});

export const universePractices: UniversePractice[] = [
  practice("wake-the-fck-up", "wtfu-morning-spark", "Morning Spark", 12, "hatha-yoga", "energy", "whole body", "moderate", "A bright whole-body sequence for the first minutes of your day."),
  practice("wake-the-fck-up", "wtfu-sun-breath", "Sun Breath", 8, "breathwork", "focus", "breath", "gentle", "Breath and attention cues for a clear, awake start."),
  practice("wake-the-fck-up", "wtfu-diamond-mining", "Diamond Mining", 18, "audio", "motivation", "whole body", "strong", "A guided practice for building heat, direction, and momentum."),
  practice("prana-fusion", "prana-circuit-builder", "Circuit Builder", 20, "breathwork", "energy", "spine", "strong", "A measured breath-and-engagement practice for resilient energy."),
  practice("prana-fusion", "prana-radiating", "Radiating", 14, "meditation", "awareness", "whole body", "gentle", "A guided scan for sensing and directing energy without strain."),
  practice("prana-fusion", "prana-grid-lock", "Grid Lock", 24, "hatha-yoga", "strength", "core", "moderate", "A structured movement sequence that layers breath, posture, and control."),
  practice("yoga-reset", "reset-midday", "Midday Reset", 15, "audio", "stress relief", "whole body", "gentle", "A compact reset for the space between work and everything else."),
  practice("yoga-reset", "reset-nadi-shodhana", "Nadi Shodhana", 10, "breathwork", "balance", "breath", "gentle", "Alternate-nostril breathing with simple pacing and recovery cues."),
  practice("yoga-reset", "reset-eastern-star", "The Eastern Star", 25, "hatha-yoga", "grounding", "whole body", "moderate", "A steady movement practice for returning to your center."),
  practice("gravity-yoga", "gravity-loose-hips", "Loose Hips", 28, "flexibility", "mobility", "hips", "moderate", "Long, supported holds for building ease around the hips."),
  practice("gravity-yoga", "gravity-long-hamstrings", "Lonnnnng Hamstrings", 26, "flexibility", "mobility", "legs", "moderate", "A patient lower-body practice built around sustainable range."),
  practice("gravity-yoga", "gravity-happy-spine", "Happy Spine", 24, "flexibility", "release", "spine", "gentle", "A supported sequence for creating room through the back body."),
  practice("here-to-there", "h2t-safe-breathing", "Safe Breathing", 12, "breathwork", "regulation", "breath", "gentle", "A careful breath practice for returning to safety and choice."),
  practice("here-to-there", "h2t-state-shift", "State Shift", 22, "audio", "transition", "whole body", "moderate", "A guided passage from the state you are leaving to the one you need."),
  practice("here-to-there", "h2t-radical-acceptance", "Radical Acceptance", 16, "meditation", "grounding", "mind", "gentle", "A steady practice for meeting what is present before asking it to change."),
];

export const universeDownloads: UniverseDownload[] = [
  { fileType: "PDF", id: "wtfu-practice-map", releaseStatus: "coming_soon", revision: "First edition", sizeLabel: "Size at release", title: "Morning practice map", universeSlug: "wake-the-fck-up" },
  { fileType: "PDF", id: "prana-field-guide", releaseStatus: "coming_soon", revision: "First edition", sizeLabel: "Size at release", title: "Prāna Fusion field guide", universeSlug: "prana-fusion" },
  { fileType: "PDF", id: "reset-state-map", releaseStatus: "coming_soon", revision: "First edition", sizeLabel: "Size at release", title: "Peak and valley state map", universeSlug: "yoga-reset" },
  { fileType: "PDF", id: "gravity-hold-guide", releaseStatus: "coming_soon", revision: "First edition", sizeLabel: "Size at release", title: "Long-hold practice guide", universeSlug: "gravity-yoga" },
  { fileType: "PDF", id: "h2t-transition-map", releaseStatus: "coming_soon", revision: "First edition", sizeLabel: "Size at release", title: "Here to There transition map", universeSlug: "here-to-there" },
];

export function getUniversePractices(slug: string) {
  return universePractices.filter((item) => item.universeSlug === slug);
}

export function getUniversePractice(slug: string, practiceId: string) {
  return universePractices.find((item) => item.universeSlug === slug && item.id === practiceId);
}

export function getUniverseDownloads(slug: string) {
  return universeDownloads.filter((item) => item.universeSlug === slug);
}
