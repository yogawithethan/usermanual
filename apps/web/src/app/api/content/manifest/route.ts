import { NextResponse } from "next/server";

import { USER_MANUAL_PRODUCT_SLUG, getUserManualEntitlement } from "@/lib/entitlements";
import { getCompletedLevelCount } from "@/lib/practice-access";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

function byLevelId<T extends Row>(rows: T[] | null, levelIdKey = "tutorial_level_id") {
  return (rows ?? []).reduce<Record<string, T[]>>((groups, row) => {
    const levelId = row[levelIdKey];
    if (!levelId) return groups;
    groups[levelId] = groups[levelId] ?? [];
    groups[levelId].push(row);
    return groups;
  }, {});
}

function sortByOrder<T extends Row>(rows: T[]) {
  return [...rows].sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0));
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function contentVersionFrom(rows: Array<Row[] | null>) {
  const timestamps = rows
    .flatMap((items) => items ?? [])
    .map((item) => item.updated_at || item.published_at || item.created_at)
    .filter(Boolean)
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value));

  if (!timestamps.length) {
    return new Date(0).toISOString();
  }

  return new Date(Math.max(...timestamps)).toISOString();
}

function mediaHref(practiceId: string) {
  return `/api/practices/${practiceId}/media`;
}

function downloadHref(downloadId: string) {
  return `/api/downloads/${downloadId}`;
}

function manifestEtag(contentVersion: string, signedIn: boolean, entitled: boolean) {
  const accessKey = signedIn ? (entitled ? "auth-paid" : "auth-free") : "anon";
  return `"um-manifest-v1-${accessKey}-${contentVersion}"`;
}

function requestHasMatchingEtag(request: Request, etag: string) {
  const header = request.headers.get("if-none-match");
  if (!header) return false;

  return header
    .split(",")
    .map((value) => value.trim())
    .some((value) => value === etag || value === `W/${etag}`);
}

export async function GET(request: Request) {
  const entitlement = await getUserManualEntitlement();
  const completedLevelCount = entitlement.userId
    ? await getCompletedLevelCount(entitlement.userId)
    : 0;
  const supabase = await createClient();
  const db = supabase as any;

  const [
    levelsResult,
    sectionsResult,
    mediaResult,
    footnotesResult,
    checklistResult,
    faqsResult,
    universesResult,
    universeSectionsResult,
    practicesResult,
    downloadsResult,
  ] = await Promise.all([
    db
      .from("tutorial_levels")
      .select("id,level_number,title,subtitle,hero,vimeo_id,icon_path,theme,published_at,updated_at")
      .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
      .eq("is_published", true)
      .order("level_number", { ascending: true }),
    db
      .from("tutorial_sections")
      .select("id,tutorial_level_id,slug,title,paragraphs,sort_order,updated_at")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    db
      .from("tutorial_media_blocks")
      .select("id,tutorial_level_id,slug,media_kind,title,caption_top,caption_bottom,asset_url,alt_text,sort_order,updated_at")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    db
      .from("tutorial_footnotes")
      .select("id,tutorial_level_id,slug,body,sort_order,updated_at")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    db
      .from("tutorial_checklist_items")
      .select("id,tutorial_level_id,body,is_complete_by_default,sort_order,updated_at")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    db
      .from("tutorial_faqs")
      .select("id,tutorial_level_id,question,answer,sort_order,updated_at")
      .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    db
      .from("practice_universes")
      .select("slug,name,tagline,description,unlock_level,color,text_color,icon_path,release_status,updated_at")
      .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
      .eq("is_published", true)
      .order("unlock_level", { ascending: true, nullsFirst: false }),
    db
      .from("practice_universe_sections")
      .select("id,universe_slug,slug,title,paragraphs,sort_order,updated_at")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    db
      .from("practices")
      .select("id,universe_slug,title,description,duration_minutes,media_kind,body_areas,goals,intensity,safety_notes,is_paid,thumbnail_url,sort_order,unlock_level,updated_at")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    db
      .from("product_downloads")
      .select("id,tutorial_level_id,title,description,sort_order,updated_at")
      .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
  ]);

  const firstError = [
    levelsResult,
    sectionsResult,
    mediaResult,
    footnotesResult,
    checklistResult,
    faqsResult,
    universesResult,
    universeSectionsResult,
    practicesResult,
    downloadsResult,
  ].find((result) => result.error)?.error;

  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 });
  }

  const levels = levelsResult.data ?? [];
  const publishedLevelIds = new Set(levels.map((level: Row) => level.id));
  const sectionsByLevel = byLevelId((sectionsResult.data ?? []).filter((row: Row) => publishedLevelIds.has(row.tutorial_level_id)));
  const mediaByLevel = byLevelId((mediaResult.data ?? []).filter((row: Row) => publishedLevelIds.has(row.tutorial_level_id)));
  const footnotesByLevel = byLevelId((footnotesResult.data ?? []).filter((row: Row) => publishedLevelIds.has(row.tutorial_level_id)));
  const checklistByLevel = byLevelId((checklistResult.data ?? []).filter((row: Row) => publishedLevelIds.has(row.tutorial_level_id)));
  const faqRows = faqsResult.data ?? [];
  const faqsByLevel = byLevelId(faqRows.filter((row: Row) => publishedLevelIds.has(row.tutorial_level_id)));
  const globalFaqs = sortByOrder(faqRows.filter((row: Row) => !row.tutorial_level_id));
  const publishedUniverseSlugs = new Set((universesResult.data ?? []).map((universe: Row) => universe.slug));
  const universeSectionRows = (universeSectionsResult.data ?? []) as Row[];
  const sectionsByUniverse = universeSectionRows
    .filter((row: Row) => publishedUniverseSlugs.has(row.universe_slug))
    .reduce<Record<string, Row[]>>((groups, row: Row) => {
      groups[row.universe_slug] = groups[row.universe_slug] ?? [];
      groups[row.universe_slug].push(row);
      return groups;
    }, {});

  const contentVersion = contentVersionFrom([
    levelsResult.data,
    sectionsResult.data,
    mediaResult.data,
    footnotesResult.data,
    checklistResult.data,
    faqsResult.data,
    universesResult.data,
    universeSectionsResult.data,
    practicesResult.data,
    downloadsResult.data,
  ]);
  const etag = manifestEtag(contentVersion, Boolean(entitlement.userId), entitlement.entitled);
  const cacheControl = entitlement.userId
    ? "private, no-store"
    : "public, max-age=60, stale-while-revalidate=300";

  if (requestHasMatchingEtag(request, etag)) {
    return new NextResponse(null, {
      headers: {
        "Cache-Control": cacheControl,
        ETag: etag,
        "X-Content-Version": contentVersion,
      },
      status: 304,
    });
  }

  const manifest = {
    access: {
      completedLevelCount,
      entitled: entitlement.entitled,
      signedIn: Boolean(entitlement.userId),
    },
    contentVersion,
    downloads: (downloadsResult.data ?? []).map((download: Row) => ({
      description: download.description,
      href: downloadHref(download.id),
      id: download.id,
      isAvailable: entitlement.entitled,
      isPaid: true,
      sortOrder: download.sort_order,
      title: download.title,
      tutorialLevelId: download.tutorial_level_id,
      updatedAt: download.updated_at,
    })),
    generatedAt: new Date().toISOString(),
    levels: levels.map((level: Row) => ({
      checklist: sortByOrder(checklistByLevel[level.id] ?? []).map((item) => ({
        body: item.body,
        id: item.id,
        isCompleteByDefault: item.is_complete_by_default,
      })),
      commentsHref: `/api/lessons/${level.level_number}/comments`,
      commentsAvailable: entitlement.entitled,
      faqs: sortByOrder([...(globalFaqs ?? []), ...(faqsByLevel[level.id] ?? [])]).map((faq) => ({
        answer: faq.answer,
        id: faq.id,
        question: faq.question,
      })),
      footnotes: sortByOrder(footnotesByLevel[level.id] ?? []).map((footnote) => ({
        body: footnote.body,
        id: footnote.id,
        slug: footnote.slug,
      })),
      hero: level.hero,
      iconPath: level.icon_path,
      id: level.id,
      isAvailable: true,
      levelNumber: level.level_number,
      media: sortByOrder(mediaByLevel[level.id] ?? []).map((item) => ({
        altText: item.alt_text,
        assetUrl: item.asset_url,
        captionBottom: item.caption_bottom,
        captionTop: item.caption_top,
        id: item.id,
        kind: item.media_kind,
        slug: item.slug,
        title: item.title,
      })),
      sections: sortByOrder(sectionsByLevel[level.id] ?? []).map((section) => ({
        id: section.id,
        paragraphs: asArray(section.paragraphs),
        slug: section.slug,
        title: section.title,
      })),
      subtitle: level.subtitle,
      theme: level.theme ?? {},
      title: level.title,
      updatedAt: level.updated_at,
      vimeoId: level.vimeo_id,
    })),
    practiceUniverses: (universesResult.data ?? []).map((universe: Row) => {
      const unlockLevel = universe.unlock_level ?? 1;
      const practices = sortByOrder(
        (practicesResult.data ?? []).filter((practice: Row) => practice.universe_slug === universe.slug),
      );

      return {
        color: universe.color,
        description: universe.description,
        iconPath: universe.icon_path,
      isAvailable: completedLevelCount >= unlockLevel,
      releaseStatus: universe.release_status,
        name: universe.name,
        practices: practices.map((practice: Row) => {
          const practiceUnlockLevel = practice.unlock_level ?? unlockLevel;
          const isAvailable =
            (!practice.is_paid || entitlement.entitled) &&
            completedLevelCount >= practiceUnlockLevel;

          return {
            bodyAreas: practice.body_areas ?? [],
            description: practice.description,
            durationMinutes: practice.duration_minutes,
            goals: practice.goals ?? [],
            href: mediaHref(practice.id),
            id: practice.id,
            intensity: practice.intensity,
            isAvailable,
            isPaid: practice.is_paid,
            kind: practice.media_kind,
            safetyNotes: practice.safety_notes,
            sortOrder: practice.sort_order,
            thumbnailUrl: practice.thumbnail_url,
            title: practice.title,
            unlockLevel: practiceUnlockLevel,
            updatedAt: practice.updated_at,
          };
        }),
        sections: sortByOrder(sectionsByUniverse[universe.slug] ?? []).map((section: Row) => ({
          id: section.id,
          paragraphs: asArray(section.paragraphs),
          slug: section.slug,
          title: section.title,
          updatedAt: section.updated_at,
        })),
        slug: universe.slug,
        tagline: universe.tagline,
        textColor: universe.text_color,
        unlockLevel,
        updatedAt: universe.updated_at,
      };
    }),
    product: {
      name: "The User Manual",
      slug: USER_MANUAL_PRODUCT_SLUG,
    },
    schemaVersion: 1,
  };

  return NextResponse.json(manifest, {
    headers: {
      "Cache-Control": cacheControl,
      ETag: etag,
      "X-Content-Version": contentVersion,
    },
  });
}

export async function HEAD(request: Request) {
  const response = await GET(request);

  return new NextResponse(null, {
    headers: response.headers,
    status: response.status,
  });
}
