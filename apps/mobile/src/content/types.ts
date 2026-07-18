export type ProgressStatus = "not_started" | "in_progress" | "completed";

export interface UserManualManifest {
  access: {
    completedLevelCount: number;
    entitled: boolean;
    signedIn: boolean;
  };
  contentVersion: string;
  downloads: Array<{
    description: string | null;
    href: string;
    id: string;
    isAvailable: boolean;
    isPaid: boolean;
    sortOrder: number | null;
    title: string;
    tutorialLevelId: string | null;
    updatedAt: string | null;
  }>;
  generatedAt: string;
  levels: TutorialLevelManifest[];
  practiceUniverses: PracticeUniverseManifest[];
  product: {
    name: string;
    slug: "the-user-manual";
  };
  schemaVersion: 1;
}

export interface TutorialLevelManifest {
  checklist: Array<{
    body: string;
    id: string;
    isCompleteByDefault: boolean;
  }>;
  commentsHref: string;
  faqs: Array<{
    answer: string;
    id: string;
    question: string;
  }>;
  footnotes: Array<{
    body: string;
    id: string;
    slug: string;
  }>;
  hero: string | null;
  iconPath: string | null;
  id: string;
  isAvailable: boolean;
  levelNumber: number;
  media: Array<{
    altText: string | null;
    assetUrl: string | null;
    captionBottom: string | null;
    captionTop: string | null;
    id: string;
    kind: string;
    slug: string;
    title: string | null;
  }>;
  sections: Array<{
    id: string;
    paragraphs: string[];
    slug: string;
    title: string;
  }>;
  subtitle: string | null;
  theme: Record<string, unknown>;
  title: string;
  updatedAt: string | null;
  vimeoId: string | null;
}

export interface PracticeUniverseManifest {
  color: string | null;
  description: string | null;
  iconPath: string | null;
  isAvailable: boolean;
  name: string;
  practices: Array<{
    bodyAreas: string[];
    description: string | null;
    durationMinutes: number | null;
    goals: string[];
    href: string;
    id: string;
    intensity: string | null;
    isAvailable: boolean;
    isPaid: boolean;
    kind: string;
    safetyNotes: string | null;
    sortOrder: number | null;
    thumbnailUrl: string | null;
    title: string;
    unlockLevel: number;
    updatedAt: string | null;
  }>;
  sections: Array<{
    id: string;
    paragraphs: string[];
    slug: string;
    title: string;
    updatedAt: string | null;
  }>;
  slug: string;
  tagline: string | null;
  textColor: string | null;
  unlockLevel: number;
  updatedAt: string | null;
}

export interface UserManualSyncPayload {
  access: {
    entitled: boolean;
    productSlug: "the-user-manual";
  };
  generatedAt: string;
  profile: {
    avatarUrl: string | null;
    displayName: string | null;
    email: string | null;
    id: string;
    onboardingCompletedAt: string | null;
    primaryGoal: string | null;
    timezone: string | null;
    updatedAt: string | null;
  } | null;
  progress: {
    levels: Array<{
      completed_at: string | null;
      level_number: number;
      started_at: string | null;
      status: ProgressStatus;
      updated_at: string;
    }>;
    practices: Array<{
      completion_count: number;
      last_completed_at: string | null;
      practice_id: string;
      status: ProgressStatus;
      updated_at: string;
    }>;
  };
  questions: unknown[];
  schemaVersion: 1;
  syncVersion: string;
  userContent: {
    notes: Array<{
      body: string;
      created_at: string;
      id: string;
      practice_id: string | null;
      tutorial_level: number | null;
      updated_at: string;
    }>;
    photos: ProgressPhoto[];
  };
}

export interface ProgressPhoto {
  created_at: string;
  href: string;
  id: string;
  label: string | null;
  storage_path: string;
  taken_at: string | null;
}

export interface LessonCommentsPayload {
  comments: Array<{
    answers?: LessonAnswer[];
    lesson_answers?: LessonAnswer[];
    body: string;
    created_at: string;
    id: string;
    is_resolved: boolean;
  }>;
}

export interface LessonAnswer {
  body: string;
  created_at: string;
  id: string;
  is_teacher_answer: boolean;
}

export interface ProtectedUrlPayload {
  expiresIn: number;
  url: string;
}
