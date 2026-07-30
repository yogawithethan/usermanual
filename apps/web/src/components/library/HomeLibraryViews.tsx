import Link from "next/link";
import type { CSSProperties } from "react";
import {
  getPracticeUniverse,
  getUniverseTutorial,
  practiceUniverses,
  universeDownloads,
  universePractices,
  type UniverseDownload,
  type UniversePractice,
} from "@islands/content";

import { SystemIcon } from "@/components/ui/SystemIcon";
import type { LibraryMode } from "@/components/library/LibraryModeSwitcher";
import { FaqWorldAccordion } from "@/components/library/FaqWorldAccordion";
import { PracticeLibraryLayout } from "@/components/library/PracticeLibraryLayout";
import { universeHref } from "@/lib/universe-routing";

import styles from "./HomeLibraryViews.module.css";

interface HomeLibraryViewProps {
  completedLevels: number[];
  entitled: boolean;
  mode: Exclude<LibraryMode, "tutorial">;
  practiceFilter: string;
  practiceQuery: string;
  practiceWorld: string;
  signedIn: boolean;
}

export function HomeLibraryView({ completedLevels, entitled, mode, practiceFilter, practiceQuery, practiceWorld, signedIn }: HomeLibraryViewProps) {
  if (mode === "practice") {
    const byKind = practiceFilter === "all"
      ? universePractices
      : universePractices.filter((practice) => practice.kind === practiceFilter);
    const byWorld = practiceWorld === "all"
      ? byKind
      : byKind.filter((practice) => practice.universeSlug === practiceWorld);
    const normalizedQuery = practiceQuery.toLocaleLowerCase();
    const practices = normalizedQuery
      ? byWorld.filter((practice) => {
          const universe = getPracticeUniverse(practice.universeSlug);
          return [
            practice.title,
            practice.description,
            practice.goal,
            practice.bodyArea,
            practice.kind,
            universe?.title ?? "",
          ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
        })
      : byWorld;
    return <PracticeLibrary completedLevels={completedLevels} entitled={entitled} practices={practices} signedIn={signedIn} />;
  }
  if (mode === "faqs") return <FaqLibrary entitled={entitled} />;
  return <DownloadLibrary completedLevels={completedLevels} downloads={universeDownloads} entitled={entitled} signedIn={signedIn} />;
}

function PracticeLibrary({
  completedLevels,
  entitled,
  practices,
  signedIn,
}: {
  completedLevels: number[];
  entitled: boolean;
  practices: UniversePractice[];
  signedIn: boolean;
}) {
  return (
    <PracticeLibraryLayout count={practices.length}>
        {practices.map((practice) => {
          const universe = getPracticeUniverse(practice.universeSlug);
          if (!universe) return null;
          const progressionReady = completedLevels.includes(universe.unlockAfterLevel);
          const status = !signedIn
            ? "Sign in"
            : !progressionReady
            ? `Finish Level ${universe.unlockAfterLevel}`
            : !entitled
              ? "Lifetime access"
              : "Coming soon";
          return (
            <Link
              className={styles.practiceCard}
              href={universeHref(universe.slug, `/practices/${practice.id}`)}
              key={practice.id}
              style={worldStyle(universe.theme.accent, universe.theme.surface, universe.theme.ink)}
            >
              <span className={styles.mediaIcon} aria-hidden>
                <SystemIcon name={practice.kind === "audio" ? "audio" : practice.kind === "breathwork" ? "spark" : "video"} />
              </span>
              <span className={styles.cardBody}>
                <span className={styles.meta}>{universe.title} · {practice.kind.replace("-", " ")} · {practice.durationMinutes} min</span>
                <strong>{practice.title}</strong>
                <small>{practice.description}</small>
              </span>
              <span className={styles.status}>{status}</span>
            </Link>
          );
        })}
      {!practices.length ? <EmptyLibrary copy="No practices match that filter yet." /> : null}
    </PracticeLibraryLayout>
  );
}

function FaqLibrary({ entitled }: { entitled: boolean }) {
  return (
    <section id="library-mode-panel" className={styles.view} role="tabpanel" aria-labelledby="library-mode-2">
      <div className={styles.worldGroups}>
        {practiceUniverses.map((universe) => {
          const tutorial = getUniverseTutorial(universe.slug);
          if (!tutorial?.faqs.length) return null;
          return <FaqWorldAccordion
            accent={universe.theme.accent}
            answers={tutorial.faqs}
            ink={universe.theme.ink}
            key={universe.slug}
            logo={universe.logo}
            surface={universe.theme.surface}
            title={universe.title}
          />;
        })}
      </div>
      <section className={styles.questionCard}>
        <span><strong>Have a different question?</strong><small>Ask Ethan from inside a lesson and join the community conversation.</small></span>
        <Link href={entitled ? "/levels/1#comments" : "/paid?feature=questions"}>{entitled ? "Ask Ethan" : "Lifetime access"}</Link>
      </section>
    </section>
  );
}

function DownloadLibrary({
  completedLevels,
  downloads,
  entitled,
  signedIn,
}: {
  completedLevels: number[];
  downloads: UniverseDownload[];
  entitled: boolean;
  signedIn: boolean;
}) {
  return (
    <section id="library-mode-panel" className={styles.view} role="tabpanel" aria-labelledby="library-mode-3">
      <p className={styles.resultCount}>{downloads.length} planned files</p>
      <div className={styles.downloadGrid}>
        {downloads.map((download) => {
          const universe = getPracticeUniverse(download.universeSlug);
          if (!universe) return null;
          const progressionReady = completedLevels.includes(universe.unlockAfterLevel);
          const status = !signedIn
            ? "Sign in"
            : !progressionReady
            ? `After Level ${universe.unlockAfterLevel}`
            : !entitled
              ? "Lifetime access"
              : "Coming soon";
          return (
            <Link
              className={styles.downloadCard}
              href={entitled ? `${universeHref(universe.slug)}?mode=downloads` : "/paid?feature=downloads"}
              key={download.id}
              style={worldStyle(universe.theme.accent, universe.theme.surface, universe.theme.ink)}
            >
              <span className={styles.downloadIcon} aria-hidden><SystemIcon name="download" /></span>
              <span className={styles.cardBody}>
                <span className={styles.meta}>{universe.title} · {download.fileType}</span>
                <strong>{download.title}</strong>
                <small>{download.revision} · {download.sizeLabel}</small>
              </span>
              <span className={styles.status}>{status}</span>
            </Link>
          );
        })}
      </div>
      <section className={styles.includedNote}>
        <SystemIcon name="spark" aria-hidden />
        <span><strong>Included when released.</strong><small>The lifetime purchase covers these files and future User Manual additions included in this offer.</small></span>
      </section>
    </section>
  );
}

function EmptyLibrary({ copy }: { copy: string }) {
  return <section className={styles.empty}><SystemIcon name="spark" aria-hidden /><strong>Nothing here yet</strong><p>{copy}</p></section>;
}

function worldStyle(accent: string, surface: string, ink: string) {
  return {
    "--library-accent": accent,
    "--library-surface": surface,
    "--library-ink": ink,
  } as CSSProperties;
}
