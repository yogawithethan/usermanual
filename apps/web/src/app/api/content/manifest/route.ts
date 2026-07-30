import { NextResponse } from "next/server";

import {
  getUniverseDownloads,
  getUniversePractices,
  getUniverseTutorial,
  practiceUniverses,
  tutorials,
  universeDownloads,
} from "@islands/content";
import { getYweMemberSession } from "@/lib/ywe-member-api";
import { universeHref } from "@/lib/universe-routing";

export const dynamic = "force-dynamic";

const CONTENT_VERSION = "2026-07-16.goal-7-detail-experiences.1";

function manifestEtag(signedIn: boolean, entitled: boolean) {
  const access = signedIn ? (entitled ? "auth-paid" : "auth-free") : "anon";
  return `"um-manifest-v1-${access}-${CONTENT_VERSION}"`;
}

function matchesEtag(request: Request, etag: string) {
  return (request.headers.get("if-none-match") ?? "")
    .split(",")
    .map((value) => value.trim())
    .some((value) => value === etag || value === `W/${etag}`);
}

export async function GET(request: Request) {
  const session = await getYweMemberSession();
  const signedIn = Boolean(session.signedIn);
  const entitled = Boolean(session.access?.entitled);
  const completedLevels = session.access?.completedLevels ?? [];
  const completedLevelCount = completedLevels.length;
  const etag = manifestEtag(signedIn, entitled);
  const cacheControl = signedIn
    ? "private, no-store"
    : "public, max-age=60, stale-while-revalidate=300";
  const headers = {
    "Cache-Control": cacheControl,
    ETag: etag,
    "X-Content-Version": CONTENT_VERSION,
  };

  if (matchesEtag(request, etag)) {
    return new NextResponse(null, { headers, status: 304 });
  }

  return NextResponse.json(
    {
      access: { completedLevelCount, entitled, signedIn },
      contentVersion: CONTENT_VERSION,
      downloads: entitled ? universeDownloads : universeDownloads.map((item) => ({
        ...item,
        href: null,
      })),
      generatedAt: new Date().toISOString(),
      levels: tutorials.map((level) => ({
        checklist: level.checklist.map((item, index) => ({
          body: item.text,
          id: `level-${level.level}-checklist-${index + 1}`,
          isCompleteByDefault: item.complete,
        })),
        commentsAvailable: entitled,
        commentsHref: `/api/lessons/${level.level}/comments`,
        faqs: (level.faqs ?? []).map((faq, index) => ({
          ...faq,
          id: `level-${level.level}-faq-${index + 1}`,
        })),
        footnotes: level.footnotes.map((footnote) => ({
          body: footnote.text,
          id: footnote.id,
        })),
        hero: level.hero,
        id: `level-${level.level}`,
        levelNumber: level.level,
        media: level.media.map((media) => ({
          captionBottom: media.captionBottom ?? null,
          captionTop: media.captionTop ?? null,
          id: media.id,
        })),
        sections: level.sections.map((section) => ({
          id: section.id,
          paragraphs: section.paragraphs,
          slug: section.id,
          title: section.title,
        })),
        subtitle: level.subtitle,
        theme: level.theme,
        title: level.title,
        vimeoId: level.vimeoId === "000000000" ? null : level.vimeoId,
      })),
      practiceUniverses: practiceUniverses.map((universe) => {
        const progressionReady = completedLevels.includes(universe.unlockAfterLevel);
        const releaseStatus = "available" as const;
        const contentAvailable = entitled && progressionReady;
        const tutorial = getUniverseTutorial(universe.slug);
        return {
          color: universe.color,
          description: universe.subtitle,
          downloads: getUniverseDownloads(universe.slug),
          iconPath: universe.icon,
          isAvailable: contentAvailable,
          name: universe.title,
          practices: getUniversePractices(universe.slug).map((practice) => ({
            ...practice,
            mediaHref: null,
            pageHref: universeHref(universe.slug, `/practices/${practice.id}`),
          })),
          releaseStatus,
          sections: contentAvailable ? (tutorial?.sections ?? []).map((section) => ({
            id: section.id,
            paragraphs: section.paragraphs,
            slug: section.id,
            title: section.title,
          })) : [],
          slug: universe.slug,
          tagline: universe.subtitle,
          textColor: universe.textColor ?? null,
          tutorialSource: tutorial?.sourceTitle ?? null,
          unlockLevel: universe.unlockAfterLevel,
        };
      }),
      product: { name: "The User Manual", slug: "the-user-manual" },
      schemaVersion: 1,
    },
    { headers },
  );
}

export async function HEAD(request: Request) {
  const response = await GET(request);
  return new NextResponse(null, { headers: response.headers, status: response.status });
}
