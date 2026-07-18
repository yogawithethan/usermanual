import {
  getTutorial,
  type TutorialChecklistItem,
  type TutorialFaq,
  type TutorialFootnote,
  type TutorialLevel,
  type TutorialMediaBlock,
  type TutorialSection,
} from "@islands/content";

import { USER_MANUAL_PRODUCT_SLUG } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_FAQS: TutorialFaq[] = [
  {
    question: "How often should I practice this level?",
    answer:
      "Short, frequent sessions are better than one long push. A few focused minutes most days will build the pattern without turning it into another thing to force.",
  },
  {
    question: "How do I know I am ready for the next level?",
    answer:
      "Move on when the main breathing pattern feels available without needing to mentally manage every step. It does not need to be perfect, just familiar enough to return to.",
  },
  {
    question: "What should I do if something feels uncomfortable?",
    answer:
      "Reduce the intensity, slow down, and stay inside a range that lets you breathe normally. Sharp pain, numbness, or strain is a sign to stop and reset.",
  },
];

interface TutorialLevelRow {
  hero: string;
  id: string;
  subtitle: string | null;
  theme: unknown;
  title: string;
  vimeo_id: string | null;
}

interface TutorialSectionRow {
  paragraphs: unknown;
  slug: string;
  title: string;
}

interface TutorialMediaRow {
  caption_bottom: string | null;
  caption_top: string | null;
  slug: string;
}

interface TutorialFootnoteRow {
  body: string;
  slug: string;
}

interface TutorialChecklistRow {
  body: string;
  is_complete_by_default: boolean;
}

interface TutorialFaqRow {
  answer: string;
  question: string;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function withDbTheme(fallback: TutorialLevel, theme: unknown): TutorialLevel["theme"] {
  if (!theme || typeof theme !== "object" || Array.isArray(theme)) {
    return fallback.theme;
  }

  return {
    ...fallback.theme,
    ...(theme as Partial<TutorialLevel["theme"]>),
    fonts: {
      ...fallback.theme.fonts,
      ...((theme as { fonts?: Partial<TutorialLevel["theme"]["fonts"]> }).fonts ?? {}),
    },
  };
}

export async function getPublishedTutorial(
  level: string | number,
  options: { preferStatic?: boolean } = {},
) {
  const fallback = getTutorial(level);

  if (!fallback) {
    return undefined;
  }

  if (options.preferStatic) {
    return { ...fallback, faqs: fallback.faqs ?? DEFAULT_FAQS };
  }

  const supabase = await createClient();
  const db = supabase as any;

  const { data: dbLevel, error: levelError } = (await db
    .from("tutorial_levels")
    .select("id,title,subtitle,hero,vimeo_id,theme")
    .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
    .eq("level_number", fallback.level)
    .eq("is_published", true)
    .maybeSingle()) as {
    data: TutorialLevelRow | null;
    error: { message: string } | null;
  };

  if (levelError) {
    console.warn("[tutorial-content] level lookup failed", levelError.message);
    return { ...fallback, faqs: fallback.faqs ?? DEFAULT_FAQS };
  }

  if (!dbLevel) {
    return { ...fallback, faqs: fallback.faqs ?? DEFAULT_FAQS };
  }

  const [sectionsResult, mediaResult, footnotesResult, checklistResult, faqsResult] =
    await Promise.all([
      db
        .from("tutorial_sections")
        .select("slug,title,paragraphs")
        .eq("tutorial_level_id", dbLevel.id)
        .eq("is_published", true)
        .order("sort_order", { ascending: true }) as Promise<{
        data: TutorialSectionRow[] | null;
        error: { message: string } | null;
      }>,
      db
        .from("tutorial_media_blocks")
        .select("slug,caption_top,caption_bottom")
        .eq("tutorial_level_id", dbLevel.id)
        .eq("is_published", true)
        .order("sort_order", { ascending: true }) as Promise<{
        data: TutorialMediaRow[] | null;
        error: { message: string } | null;
      }>,
      db
        .from("tutorial_footnotes")
        .select("slug,body")
        .eq("tutorial_level_id", dbLevel.id)
        .eq("is_published", true)
        .order("sort_order", { ascending: true }) as Promise<{
        data: TutorialFootnoteRow[] | null;
        error: { message: string } | null;
      }>,
      db
        .from("tutorial_checklist_items")
        .select("body,is_complete_by_default")
        .eq("tutorial_level_id", dbLevel.id)
        .eq("is_published", true)
        .order("sort_order", { ascending: true }) as Promise<{
        data: TutorialChecklistRow[] | null;
        error: { message: string } | null;
      }>,
      db
        .from("tutorial_faqs")
        .select("question,answer")
        .eq("tutorial_level_id", dbLevel.id)
        .eq("is_published", true)
        .order("sort_order", { ascending: true }) as Promise<{
        data: TutorialFaqRow[] | null;
        error: { message: string } | null;
      }>,
    ]);

  const sections: TutorialSection[] = sectionsResult.data?.length
    ? sectionsResult.data.map((section) => ({
        id: section.slug,
        paragraphs: asStringArray(section.paragraphs),
        title: section.title,
      }))
    : fallback.sections;

  const media: TutorialMediaBlock[] = mediaResult.data?.length
    ? mediaResult.data.map((item) => ({
        captionBottom: item.caption_bottom ?? undefined,
        captionTop: item.caption_top ?? undefined,
        id: item.slug,
      }))
    : fallback.media;

  const footnotes: TutorialFootnote[] = footnotesResult.data?.length
    ? footnotesResult.data.map((item) => ({
        id: item.slug,
        text: item.body,
      }))
    : fallback.footnotes;

  const checklist: TutorialChecklistItem[] = checklistResult.data?.length
    ? checklistResult.data.map((item) => ({
        complete: item.is_complete_by_default,
        text: item.body,
      }))
    : fallback.checklist;

  const faqs: TutorialFaq[] = faqsResult.data?.length
    ? faqsResult.data
    : fallback.faqs ?? DEFAULT_FAQS;

  return {
    ...fallback,
    checklist,
    faqs,
    footnotes,
    hero: dbLevel.hero,
    media,
    sections,
    subtitle: dbLevel.subtitle ?? fallback.subtitle,
    theme: withDbTheme(fallback, dbLevel.theme),
    title: dbLevel.title,
    vimeoId: dbLevel.vimeo_id ?? fallback.vimeoId,
  };
}
