import type { CSSProperties, ReactNode } from "react";
import { ViewTransition } from "react";
import Link from "next/link";
import type { PracticeUniverse } from "@islands/content";

import { UniverseAtmosphere } from "@/components/motion/UniverseAtmosphere";
import { SystemIcon } from "@/components/ui/SystemIcon";
import { BrandedVimeoPlayer } from "./BrandedVimeoPlayer";
import styles from "./DetailExperience.module.css";

export interface DetailTheme {
  accent: string;
  accentSoft: string;
  bodyFont: string;
  headingFont: string;
  heroFrom: string;
  heroTo: string;
  ink: string;
  surface: string;
}

export interface DetailChapter {
  id: string;
  kind?: "chapter" | "complete" | "faq" | "practice" | "video";
  label: string;
}

export function DetailExperience({
  children,
  theme,
  transitionName,
}: {
  children: ReactNode;
  theme: DetailTheme;
  transitionName: string;
}) {
  const style = {
    "--detail-accent": theme.accent,
    "--detail-accent-soft": theme.accentSoft,
    "--detail-body-font": theme.bodyFont,
    "--detail-heading-font": theme.headingFont,
    "--detail-hero-from": theme.heroFrom,
    "--detail-hero-to": theme.heroTo,
    "--detail-ink": theme.ink,
    "--detail-surface": theme.surface,
  } as CSSProperties;

  return (
    <ViewTransition name={transitionName} share="detail-morph" default="none">
      <main id="top" className={styles.page} style={style}>{children}</main>
    </ViewTransition>
  );
}

export function DetailGate({
  action,
  body,
  headline,
  icon = "lock",
  logo,
  state,
  status,
  theme,
  title,
  transitionName,
}: {
  action: ReactNode;
  body?: string;
  headline?: {
    state: string;
    title: string;
  };
  icon?: "account" | "clock" | "lock" | "spark" | null;
  logo?: string;
  state: string;
  status?: ReactNode;
  theme: DetailTheme;
  title: string;
  transitionName: string;
}) {
  return (
    <DetailExperience theme={theme} transitionName={transitionName}>
      <section className={styles.gate} aria-labelledby="detail-gate-title">
        <div className={styles.gateCard}>
          {icon ? <span className={styles.gateIcon} aria-hidden><GateIcon type={icon} /></span> : null}
          {headline ? (
            <h1 id="detail-gate-title" className={styles.gateHeadline}>
              <span className={styles.gateHeadlineState}>{headline.state}</span>
              <span className={styles.gateHeadlineDot} aria-hidden>•</span>
              <span className={styles.gateHeadlineTitle}>{headline.title}</span>
            </h1>
          ) : (
            <>
              <p className={styles.gateState}>{state}</p>
              {logo ? <img className={styles.gateLogo} src={logo} alt="" aria-hidden /> : null}
              <h1 id="detail-gate-title" className={logo ? "sr-only" : styles.gateTitle}>{title}</h1>
            </>
          )}
          {body ? <p className={styles.gateBody}>{body}</p> : null}
          {status ? <div className={styles.gateStatus}>{status}</div> : null}
          <div className={styles.gateActions}>{action}</div>
        </div>
      </section>
    </DetailExperience>
  );
}

export function DetailGatePrimary({ children, href }: { children: ReactNode; href: string }) {
  return <Link className={styles.gatePrimary} href={href} transitionTypes={["nav-forward"]}>{children}</Link>;
}

export function DetailGateSecondary({ children, href = "/" }: { children: ReactNode; href?: string }) {
  return (
    <Link className={styles.gateSecondary} href={href} transitionTypes={["nav-back"]}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m15 18-6-6 6-6" />
      </svg>
      {children}
    </Link>
  );
}

function GateIcon({ type }: { type: "account" | "clock" | "lock" | "spark" }) {
  if (type === "account") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></svg>;
  if (type === "clock") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
  if (type === "spark") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></svg>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
}

export function DetailHero({
  atmosphere = "clouds",
  icon,
  logo,
  subtitle,
  title,
  universeSlug,
}: {
  atmosphere?: "clouds" | "still";
  icon: string;
  logo?: string;
  subtitle: string;
  title: string;
  universeSlug?: PracticeUniverse["slug"];
}) {
  return (
    <section className={styles.hero} aria-labelledby="detail-title" data-universe={universeSlug}>
      {!universeSlug && atmosphere === "clouds" ? (
        <>
          <img className={`${styles.cloud} ${styles.cloudA}`} src="/clouds/cloud-2.png" alt="" aria-hidden />
          <img className={`${styles.cloud} ${styles.cloudB}`} src="/clouds/cloud-2.png" alt="" aria-hidden />
        </>
      ) : null}
      {universeSlug ? <UniverseAtmosphere className={styles.heroAtmosphere} slug={universeSlug} /> : null}
      <div className={styles.heroContent}>
        <span className={styles.heroIcon} aria-hidden>
          <span className={styles.heroIconMask} style={{ mask: `url('${icon}') center / contain no-repeat`, WebkitMask: `url('${icon}') center / contain no-repeat` }} />
        </span>
        {logo ? <img className={styles.heroLogo} src={logo} alt="" aria-hidden /> : <h1 id="detail-title" className={styles.heroTitle}>{title}</h1>}
        {logo ? <h1 id="detail-title" className="sr-only">{title}</h1> : null}
        <p className={styles.heroSubtitle}>{subtitle}</p>
      </div>
    </section>
  );
}

export function DetailArticle({ children }: { children: ReactNode }) {
  return <article className={styles.article}>{children}</article>;
}

export function DetailSection({ children, compactAfter = false, id, title }: { children: ReactNode; compactAfter?: boolean; id: string; title: string }) {
  return (
    <section id={id} className={`${styles.section} ${compactAfter ? styles.sectionCompactAfter : ""}`}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.copy}>{children}</div>
    </section>
  );
}

export function DetailVideo({ vimeoId }: { vimeoId?: string | null }) {
  const usableId = vimeoId && vimeoId !== "000000000" ? vimeoId : null;
  return (
    <DetailSection id="video" title="Video">
      <div className={styles.videoFrame}>
        {usableId ? (
          <BrandedVimeoPlayer source={usableId} />
        ) : (
          <div className={styles.videoPoster}>
            <div>
              <span className={styles.play} aria-hidden>
                <SystemIcon name="play" />
              </span>
              <p className={styles.videoLabel}>Video · coming soon</p>
            </div>
          </div>
        )}
      </div>
    </DetailSection>
  );
}

export function DetailComplete({ action, label = "Complete tutorial", note = "You can change this later." }: { action: (formData: FormData) => void | Promise<void>; label?: string; note?: string }) {
  return (
    <section id="complete" className={`${styles.section} ${styles.completeZone}`}>
      <p>{note}</p>
      <form action={action}><button type="submit">{label}</button></form>
    </section>
  );
}

export { styles as detailStyles };
