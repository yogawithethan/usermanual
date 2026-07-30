import type { ReactNode } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { FaqAccordion } from "@/components/tutorials/FaqAccordion";
import { MarkdownContent } from "@/components/tutorials/MarkdownContent";
import { AssociatedPractices } from "@/components/detail/AssociatedPractices";
import { ChapterNavigator } from "@/components/detail/ChapterNavigator";
import { LevelCompletion } from "@/components/detail/LevelCompletion";
import {
  DetailArticle,
  DetailExperience,
  DetailGate,
  DetailGatePrimary,
  DetailGateSecondary,
  DetailHero,
  DetailSection,
  DetailVideo,
  detailStyles,
  type DetailTheme,
} from "@/components/detail/DetailExperience";
import {
  InteractiveChecklist,
  type InteractiveChecklistItem,
} from "@/components/detail/InteractiveChecklist";
import type {
  TutorialFootnote,
  TutorialMediaBlock,
  TutorialSection,
} from "@islands/content";
import {
  getTutorial,
  tutorials,
} from "@islands/content";
import { getPublishedTutorial } from "@/lib/tutorial-content";
import { ThemeProvider } from "@/themes/ThemeProvider";
import { dseTheme } from "@/themes/dse";
import {
  DEV_PROGRESS_COOKIE,
  devCompletedLevelCount,
  normalizeDevProgressMode,
} from "@/lib/dev-progress";
import { getUserManualEntitlement } from "@/lib/entitlements";
import { WELCOME_COMPLETED_COOKIE } from "@/lib/welcome";
import { YwePasswordlessAccess } from "@/components/auth/YwePasswordlessAccess";
import { getDevAccessPreview } from "@/lib/dev-access-preview";
import { callYweMemberApi, getYweMemberSession } from "@/lib/ywe-member-api";

interface LevelPageProps {
  params: Promise<{
    level: string;
  }>;
}

export function generateStaticParams() {
  return tutorials.map((tutorial) => ({
    level: String(tutorial.level),
  }));
}

export default async function LevelPage({ params }: LevelPageProps) {
  const { level } = await params;
  const cookieStore = await cookies();
  const devAccessPreview = await getDevAccessPreview();
  const devProgressMode = devAccessPreview.enabled
    ? normalizeDevProgressMode(cookieStore.get(DEV_PROGRESS_COOKIE)?.value)
    : "real";
  const isDevProgressOverride = devProgressMode !== "real";
  const hasDevDetailAccess = devAccessPreview.fullAccess || isDevProgressOverride;
  const tutorial = await getPublishedTutorial(level);

  if (!tutorial) {
    notFound();
  }

  const lessonTheme = tutorial.theme;
  const detailTheme = {
    accent: lessonTheme.accent,
    accentSoft: lessonTheme.accentSoft,
    bodyFont: lessonTheme.fonts.body,
    headingFont: lessonTheme.fonts.heading,
    heroFrom: lessonTheme.heroFrom,
    heroTo: lessonTheme.heroTo,
    ink: "#171717",
    surface: lessonTheme.surface,
  };

  const memberSession = await getYweMemberSession();
  const userId = memberSession.signedIn || devAccessPreview.signedIn || isDevProgressOverride
    ? "shared-ywe-member"
    : null;

  if (
    !userId &&
    !hasDevDetailAccess &&
    cookieStore.get(WELCOME_COMPLETED_COOKIE)?.value !== "1"
  ) {
    return <LevelGate tutorial={tutorial} theme={detailTheme} state="Start Here required" body="The welcome experience comes first. Finish it once, then create or enter your shared Yoga With Ethan account to open Level 1." action={<><DetailGatePrimary href={`/welcome?next=/levels/${tutorial.level}`}>Begin Start Here</DetailGatePrimary><DetailGateSecondary>Back</DetailGateSecondary></>} icon="spark" />;
  }

  if (!userId) {
    return (
      <LevelGate
        tutorial={tutorial}
        theme={detailTheme}
        state="Account required"
        headline={{ state: "Account required", title: `Level ${tutorial.level}` }}
        action={(
          <>
            <YwePasswordlessAccess
              next={`/levels/${tutorial.level}`}
              showBrand={false}
            />
            <DetailGateSecondary>Back</DetailGateSecondary>
          </>
        )}
        icon={null}
      />
    );
  }

  const profile = memberSession.profile;

  if (!hasDevDetailAccess && !profile?.welcomeCompletedAt) {
    return <LevelGate tutorial={tutorial} theme={detailTheme} state="Start Here required" body="Complete the welcome experience before opening the first level. You only need to do this once." action={<><DetailGatePrimary href={`/welcome?next=/levels/${tutorial.level}`}>Continue Start Here</DetailGatePrimary><DetailGateSecondary>Back</DetailGateSecondary></>} icon="spark" />;
  }

  if (!hasDevDetailAccess && !profile?.onboardingCompletedAt) {
    return <LevelGate tutorial={tutorial} theme={detailTheme} state="One last step" body="Set your starting preferences so the User Manual can keep your place and send only the reminders you want." action={<><DetailGatePrimary href={`/onboarding?next=/levels/${tutorial.level}`}>Finish account setup</DetailGatePrimary><DetailGateSecondary>Back</DetailGateSecondary></>} icon="account" />;
  }

  const entitled = Boolean(memberSession.access?.entitled) || devAccessPreview.entitled;
  const progress = memberSession.access?.levelProgress ?? [];
  const realCompletedLevelCount = progress.filter(
    (item) => item.status === "completed",
  ).length;
  const completedLevelCount = devCompletedLevelCount(
    devProgressMode,
    realCompletedLevelCount,
  );

  if (tutorial.level > completedLevelCount + 1) {
    return <LevelGate tutorial={tutorial} theme={detailTheme} state="Progression locked" body={`Complete Level ${completedLevelCount + 1} before opening Level ${tutorial.level}. Purchase never skips the free level sequence.`} action={<><DetailGatePrimary href={`/levels/${completedLevelCount + 1}`}>Continue with Level {completedLevelCount + 1}</DetailGatePrimary><DetailGateSecondary>Back to the roadmap</DetailGateSecondary></>} icon="lock" />;
  }

  const commentsResponse = entitled && memberSession.signedIn
    ? await callYweMemberApi(`/api/lessons/${tutorial.level}/comments`)
    : null;
  const commentsPayload = commentsResponse?.ok
    ? await commentsResponse.json() as { comments?: any[] }
    : null;
  const comments = commentsPayload?.comments ?? [];
  const levelCompleted = progress?.some((item) => item.level_number === tutorial.level && item.status === "completed") ?? false;
  const stepSections = tutorial.sections.filter(isStepSection);
  const navigableSections = stepSections.length
    ? tutorial.level === 2
      ? stepSections.slice(0, 2)
      : stepSections
    : tutorial.sections
        .filter((section) => !sectionChecklistItems(section).length)
        .slice(0, 6);
  const chapterSections = tutorial.level === 1 ? tutorial.sections : navigableSections;
  const chapters = [
    { id: "video", kind: "video" as const, label: "Video" },
    ...chapterSections.map((section) => ({
      id: section.id,
      kind: "chapter" as const,
      label: plainTitle(section.title),
    })),
    { id: "complete", kind: "complete" as const, label: "Complete level" },
    { id: "faq", kind: "faq" as const, label: "FAQs" },
    { id: "practices", kind: "practice" as const, label: "Practice" },
  ];
  const firstStepIndex = tutorial.sections.findIndex(isStepSection);
  const readinessSections = tutorial.sections.filter(
    (section, index) =>
      index < (firstStepIndex < 0 ? tutorial.sections.length : firstStepIndex) &&
      sectionChecklistItems(section).length > 0,
  );
  const readinessIds = new Set(readinessSections.map((section) => section.id));
  const readinessItems = readinessSections.flatMap((section) =>
    sectionChecklistItems(section).map((item) => ({
      ...item,
      group: plainTitle(section.title),
    })),
  );
  const firstReadinessId = readinessSections[0]?.id;
  const hasAuthoredChecklists = tutorial.sections.some(
    (section) => sectionChecklistItems(section).length > 0,
  );

  return (
    <ThemeProvider theme={dseTheme} className="flex-1">
      <DetailExperience theme={detailTheme} transitionName={`detail-level-${tutorial.level}`}>
        <DetailHero icon="/tutorial-icons/dse-cloud-icon.svg" subtitle={tutorial.subtitle} title={tutorial.title} atmosphere="clouds" />
        <ChapterNavigator chapters={chapters} />
        <DetailArticle>
          <DetailVideo vimeoId={tutorial.vimeoId} />

          {tutorial.sections.map((section, index) => {
            const checklistItems = sectionChecklistItems(section);
            const isReadinessSection = readinessIds.has(section.id);
            let content: ReactNode = null;

            if (isReadinessSection) {
              if (section.id === firstReadinessId) {
                content = (
                  <InteractiveChecklist
                    heading="Readiness checklist"
                    id="readiness-checklist"
                    intro="Use this private checklist to gauge your readiness. Check and uncheck anything as your practice changes; it never blocks the tutorial."
                    items={readinessItems}
                    storageKey={`level-${tutorial.level}-readiness`}
                  />
                );
              }
            } else {
              content = (
                <>
                  <DetailSection compactAfter={checklistItems.length > 0} id={section.id} title={plainTitle(section.title)}>
                    <div>
                      <MarkdownContent
                        blocks={sectionCopyBlocks(section)}
                        footnotes={section.footnotes ?? []}
                      />
                    </div>
                  </DetailSection>
                  {checklistItems.length ? (
                    <InteractiveChecklist
                      embedded
                      heading="Mastery Checklist"
                      id={`${section.id}-checklist`}
                      intro="Keep this beside the technique as a private working reflection. Check and uncheck anything as your practice changes."
                      items={checklistItems}
                      storageKey={`level-${tutorial.level}-${section.id}`}
                    />
                  ) : null}
                </>
              );
            }

            return (
              <div key={section.id}>
                {content}
                {tutorial.level !== 1 && index === 1 && (
                  <>
                    <MediaBlocks media={tutorial.media} accent={lessonTheme.accent} />
                    <Footnotes footnotes={tutorial.footnotes} />
                  </>
                )}
              </div>
            );
          })}

          <LevelCompletion initiallyComplete={levelCompleted} level={tutorial.level} />

          <section id="faq" className="scroll-mt-12 pt-16">
            <h2 className="text-[32px] font-bold text-[#111111]" style={{ fontFamily: lessonTheme.fonts.heading }}>
              FAQs
            </h2>
            <FaqAccordion
              accent={lessonTheme.accent}
              bodyFont={lessonTheme.fonts.body}
              items={tutorial.faqs ?? []}
            />
          </section>

          <LessonComments
            accent={lessonTheme.accent}
            comments={comments ?? []}
            entitled={entitled}
            headingFont={lessonTheme.fonts.heading}
            level={tutorial.level}
          />

          <AssociatedPractices practices={[]} />
          {!hasAuthoredChecklists ? (
            <InteractiveChecklist items={tutorial.checklist} storageKey={`level-${tutorial.level}`} />
          ) : null}

        </DetailArticle>
      </DetailExperience>
    </ThemeProvider>
  );
}

function plainTitle(value: string) {
  return value.replace(/[*_`~]/g, "").replace(/\s+/g, " ").trim();
}

function isStepSection(section: TutorialSection) {
  return /^step\s*(?:(?:number|#)\s*)?\d+\b/i.test(
    plainTitle(section.title),
  );
}

function sectionChecklistItems(
  section: TutorialSection,
): InteractiveChecklistItem[] {
  if (section.checklist?.length) {
    return section.checklist.map((text) => ({ complete: false, text }));
  }
  return section.paragraphs.flatMap((paragraph) =>
    paragraph.split("\n").flatMap((line) => {
      const match = line.match(/^\s*[-*]\s+\[([ xX])\]\s+(.+?)\s*$/);
      if (!match) return [];
      return [
        {
          complete: match[1].toLowerCase() === "x",
          text: match[2],
        },
      ];
    }),
  );
}

function sectionCopyBlocks(section: TutorialSection): string[] {
  return section.paragraphs.flatMap((paragraph) => {
    const lines = paragraph.split("\n").filter(
      (line) => !/^\s*[-*]\s+\[[ xX]\]\s+/.test(line),
    );
    return lines.length ? [lines.join("\n")] : [];
  });
}

function LevelGate({ action, body, headline, icon, state, theme, tutorial }: {
  action: ReactNode;
  body?: string;
  headline?: {
    state: string;
    title: string;
  };
  icon: "account" | "clock" | "lock" | "spark" | null;
  state: string;
  theme: DetailTheme;
  tutorial: NonNullable<ReturnType<typeof getTutorial>>;
}) {
  return (
    <ThemeProvider theme={dseTheme} className="flex-1">
      <DetailGate
        action={action}
        body={body}
        headline={headline}
        icon={icon}
        state={state}
        theme={theme}
        title={`Level ${tutorial.level}`}
        transitionName={`detail-level-${tutorial.level}`}
      />
    </ThemeProvider>
  );
}

async function submitLessonComment(formData: FormData) {
  "use server";

  const level = Number(formData.get("level"));
  const body = String(formData.get("body") ?? "").trim();
  const entitlement = await getUserManualEntitlement();

  if (!entitlement.userId) {
    redirect(`/login?next=/levels/${level || 1}#comments`);
  }

  if (!entitlement.entitled) {
    redirect(`/paid?feature=comments`);
  }

  if (!Number.isInteger(level) || level < 1 || body.length < 3 || body.length > 2000) {
    redirect(`/levels/${Number.isInteger(level) && level > 0 ? level : 1}#comments`);
  }

  const response = await callYweMemberApi(`/api/lessons/${level}/comments`, {
    body: JSON.stringify({ body }),
    method: "POST",
  });
  if (!response.ok) redirect(`/levels/${level}?error=comment#comments`);

  revalidatePath(`/levels/${level}`);
  redirect(`/levels/${level}#comments`);
}

function displayName(profile: unknown) {
  if (!profile || typeof profile !== "object") return "Student";
  const value = (profile as { display_name?: string | null }).display_name;
  return value || "Student";
}

function formatCommentDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function LessonComments({
  accent,
  comments,
  entitled,
  headingFont,
  level,
}: {
  accent: string;
  comments: any[];
  entitled: boolean;
  headingFont: string;
  level: number;
}) {
  if (!entitled) {
    return (
      <section id="comments" className="scroll-mt-12 pt-16">
        <h2
          className={`${detailStyles.communityHeading} text-[32px] font-bold`}
          style={{ fontFamily: headingFont }}
        >
          Community Questions
        </h2>
        <div className={`${detailStyles.communityCard} shape-card mt-5 p-5`}>
          <p className={`${detailStyles.communityMuted} text-[17px] leading-7`}>
            Reading community questions and asking Ethan a question are included
            in the lifetime User Manual companion.
          </p>
          <Link
            href="/paid?feature=comments"
            transitionTypes={["nav-forward"]}
            className="shape-control mt-4 inline-flex h-11 items-center justify-center px-5 text-[15px] font-bold text-white"
            style={{ background: accent }}
          >
            Unlock community questions
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section id="comments" className="scroll-mt-12 pt-16">
      <h2
        className={`${detailStyles.communityHeading} text-[32px] font-bold`}
        style={{ fontFamily: headingFont }}
      >
        Community Notes
      </h2>
      <form action={submitLessonComment} className={`${detailStyles.communityCard} shape-card mt-5 p-5`}>
        <input type="hidden" name="level" value={level} />
        <label className="block">
          <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#7A7772]">
            Ask a question or leave a note
          </span>
          <textarea
            name="body"
            required
            minLength={3}
            maxLength={2000}
            rows={4}
            className={`${detailStyles.communityField} shape-card mt-3 w-full px-4 py-3 text-[17px] leading-6 outline-none focus:ring-4`}
            style={{ ["--tw-ring-color" as string]: `${accent}22` }}
          />
        </label>
        <button
          type="submit"
          className="shape-control mt-4 inline-flex h-11 items-center justify-center px-5 text-[15px] font-bold text-white"
          style={{ background: accent }}
        >
          Post publicly
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {comments.length ? (
          comments.map((comment) => (
            <article
              key={comment.id}
              className={`${detailStyles.communityCard} shape-card p-5`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className={`${detailStyles.communityHeading} text-[14px] font-bold`}>
                  {displayName(comment.profiles)}
                </p>
                <p className="text-[12px] font-semibold text-[#8A8580]">
                  {formatCommentDate(comment.created_at)}
                </p>
              </div>
              <p className={`${detailStyles.communityCopy} mt-3 text-[17px] leading-7`}>
                {comment.body}
              </p>
              {comment.lesson_answers?.length ? (
                <div className="mt-4 space-y-3 border-l-2 pl-4" style={{ borderColor: accent }}>
                  {comment.lesson_answers.map((answer: any) => (
                    <div key={answer.id}>
                      <p className="text-[12px] font-black uppercase tracking-[0.1em]" style={{ color: answer.is_teacher_answer ? accent : "#8A8580" }}>
                        {answer.is_teacher_answer ? "Teacher answer" : displayName(answer.profiles)}
                      </p>
                      <p className={`${detailStyles.communityCopy} mt-1 text-[15px] leading-6`}>
                        {answer.body}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <div className={`${detailStyles.communityEmpty} shape-card border border-dashed px-5 py-5 text-[16px]`}>
            No public notes yet.
          </div>
        )}
      </div>
    </section>
  );
}

function MediaBlocks({
  accent,
  media,
}: {
  accent: string;
  media: TutorialMediaBlock[];
}) {
  if (media.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 pt-14">
      {media.map((block) => (
        <figure key={block.id} className="text-center">
          {block.captionTop && (
            <figcaption className="mb-4 text-[18px] italic text-[#7A7772]">
              {block.captionTop}
            </figcaption>
          )}
          <div className="shape-frame flex aspect-[16/7] items-center justify-center border border-dashed bg-[#EEF4FF] text-[#7EA7CB]" style={{ borderColor: `${accent}33` }}>
            <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="7" y="10" width="34" height="28" rx="4" />
              <path d="M14 31l7-7 6 6 4-4 5 5" />
              <circle cx="17" cy="18" r="3" />
            </svg>
          </div>
          {block.captionBottom && (
            <figcaption className="mt-4 text-[18px] italic text-[#7A7772]">
              {block.captionBottom}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

function Footnotes({ footnotes }: { footnotes: TutorialFootnote[] }) {
  if (footnotes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 pt-10">
      {footnotes.map((footnote) => (
        <aside
          key={footnote.id}
          className="shape-card border border-[#2D2B2A] bg-transparent px-5 py-4 text-[18px] leading-[1.55] text-[#2D2B2A] md:text-[21px]"
        >
          <MarkdownContent blocks={[footnote.text]} />
        </aside>
      ))}
    </div>
  );
}

function MasteryChecklist({
  accent,
  accentSoft,
  headingFont,
  items,
}: {
  accent: string;
  accentSoft: string;
  headingFont: string;
  items: { text: string; complete: boolean }[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="shape-frame mt-14 border px-6 py-6 shadow-[0_8px_24px_rgba(12,19,45,0.04)] md:px-10" style={{ background: accentSoft, borderColor: `${accent}24` }}>
      <h2
        className="mb-6 text-[21px] font-bold uppercase tracking-[0.08em]"
        style={{ color: accent, fontFamily: headingFont }}
      >
        Mastery Checklist
      </h2>
      <ul className="space-y-5">
        {items.map((item) => (
          <li key={item.text} className="flex items-start gap-4 text-[19px] text-[#536071] md:text-[22px]">
            <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-white" style={{ background: accent }}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            <span className={item.complete ? "line-through decoration-[#536071] decoration-2" : ""}>
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
