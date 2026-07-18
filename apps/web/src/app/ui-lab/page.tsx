import type { Metadata } from "next";

import { SystemIcon } from "@/components/ui/SystemIcon";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Squircle Shape Study | UI Laboratory",
  description: "Card, frame, and tag geometry options for the User Manual design system.",
  robots: { index: false, follow: false },
};

const cardOptions = [
  {
    id: "gentle",
    number: "01",
    name: "Gentle squircle",
    note: "Closest to the current system",
    radius: "24px",
    small: "16px",
    copy: "Softens the rectangular frames without making every surface feel bubbly. The safest system-wide change.",
  },
  {
    id: "balanced",
    number: "02",
    name: "Balanced squircle",
    note: "Recommended starting point",
    radius: "34px",
    small: "20px",
    copy: "A more visible superellipse silhouette with enough straight edge left for forms, lists, and longer lesson content.",
  },
  {
    id: "expressive",
    number: "03",
    name: "Expressive squircle",
    note: "Selected direction",
    radius: "46px",
    small: "36–38px",
    copy: "Makes cards feel like polished objects. The larger nested radius now carries the same softness into settings, lists, and content frames without turning them into pills.",
  },
] as const;

const tagOptions = [
  { id: "pill", name: "Current pill", token: "999px", note: "Keep as-is" },
  { id: "near", name: "Near-pill squircle", token: "pill · 1.25 curve", note: "Almost a pill · suggested" },
  { id: "soft", name: "Soft squircle", token: "16px", note: "More visibly squared" },
] as const;

export default function UiLabPage() {
  return (
    <main className={`${styles.page} app-chrome`}>
      <div className={styles.shell}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>UI Laboratory · Geometry</p>
          <h1>Squircle shape study</h1>
          <p className={styles.lede}>
            Three strengths applied to the same frame hierarchy. Choose the overall direction first; then the winning geometry becomes a shared token for cards, forms, notices, modals, settings, and detail pages.
          </p>
        </header>

        <nav className={styles.nav} aria-label="Shape study sections">
          <a href="#cards">Card and frame options</a>
          <a href="#combinations">Chosen combination</a>
          <a href="#tags">Tag options</a>
          <a href="#tokens">System mapping</a>
        </nav>

        <section id="cards" className={styles.section}>
          <SectionHeading eyebrow="01 · Main decision" title="Cards and frames" copy="Each column contains an outer frame, nested content card, notice, and icon control so you can judge the whole family—not one isolated rectangle." />
          <div className={styles.optionGrid}>
            {cardOptions.map((option) => (
              <article className={`${styles.option} ${styles[option.id]}`} data-selected={option.id === "expressive" || undefined} key={option.id}>
                <header className={styles.optionHeader}>
                  <span className={styles.optionNumber}>{option.number}</span>
                  <div>
                    <h2>{option.name}</h2>
                    <p>{option.note}</p>
                  </div>
                  {option.id === "expressive" ? <span className={styles.selectedBadge}><SystemIcon name="check" /> Chosen</span> : null}
                </header>

                <div className={styles.specimen}>
                  <div className={styles.specimenTopline}>
                    <span className={styles.microLabel}>Your next practice</span>
                    <span className={styles.statusTag}>In progress</span>
                  </div>
                  <h3>Return to your breath.</h3>
                  <p className={styles.specimenCopy}>A quiet twelve-minute practice for finding steadiness without forcing it.</p>

                  <div className={styles.mediaCard}>
                    <span className={styles.mediaIcon}><SystemIcon name="audio" /></span>
                    <span className={styles.mediaText}>
                      <strong>Soft Landing</strong>
                      <small>12 min · Level 2</small>
                    </span>
                    <button type="button" aria-label="Play Soft Landing"><SystemIcon name="play" /></button>
                  </div>

                  <div className={styles.notice}>
                    <SystemIcon name="spark" />
                    <span><strong>Your place is saved.</strong><small>Come back whenever you are ready.</small></span>
                  </div>

                  <button className={styles.primaryAction} type="button">Continue practice <SystemIcon name="arrow-right" /></button>
                </div>

                <div className={styles.optionMeta}>
                  <span><small>Large frame</small><strong>{option.radius}</strong></span>
                  <span><small>Nested frame</small><strong>{option.small}</strong></span>
                </div>
                <p className={styles.optionCopy}>{option.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="combinations" className={styles.section}>
          <SectionHeading eyebrow="02 · Combined system" title="Expressive frames + near-pill controls" copy="Four realistic surfaces using the chosen geometry together. Large containers are expressive squircles; nested content uses the same family at a tighter radius; navigation, filters, statuses, fields, and actions use the near-pill curve." />

          <div className={styles.combinationLegend} aria-label="Chosen geometry legend">
            <span><i data-shape="frame" /> Expressive frame</span>
            <span><i data-shape="nested" /> Nested squircle</span>
            <span><i data-shape="control" /> Near-pill control</span>
            <span><i data-shape="icon" /> Circular icon</span>
          </div>

          <div className={styles.combinationGrid}>
            <article id="combo-roadmap" className={styles.combinationCase}>
              <CaseHeader number="01" title="Tutorial roadmap" copy="Navigation, progress, lesson cards, and primary action." />
              <div className={`${styles.productMockup} ${styles.roadmapMockup}`}>
                <SegmentedControl labels={["Tutorial", "Practice", "FAQs", "Downloads"]} selected="Tutorial" />
                <div className={styles.mockupHeading}>
                  <div><span className={styles.microLabel}>Your path</span><h3>Keep going.</h3></div>
                  <span className={styles.nearStatus}><SystemIcon name="seal-check" /> 2 of 6</span>
                </div>
                <div className={styles.roadmapList}>
                  <div data-state="complete"><span className={styles.stepIndex}>01</span><span><strong>Upright & confident</strong><small>Level 1 · Complete</small></span><i><SystemIcon name="check" /></i></div>
                  <div data-state="current"><span className={styles.stepIndex}>02</span><span><strong>Grounded & aware</strong><small>Level 2 · In progress</small></span><i><SystemIcon name="arrow-right" /></i></div>
                  <div data-state="locked"><span className={styles.stepIndex}>03</span><span><strong>Breath & stillness</strong><small>Level 3 · Next</small></span><i><SystemIcon name="lock" /></i></div>
                </div>
                <button className={styles.nearPrimary} type="button">Continue Level 2 <SystemIcon name="arrow-right" /></button>
              </div>
            </article>

            <article id="combo-library" className={styles.combinationCase}>
              <CaseHeader number="02" title="Practice library" copy="Mode switcher, filters, media cards, and access states." />
              <div className={`${styles.productMockup} ${styles.libraryMockup}`}>
                <SegmentedControl labels={["List", "Grid"]} selected="List" compact />
                <div className={styles.nearFilters} aria-label="Practice filters">
                  <button type="button" data-selected>All</button><button type="button">Audio</button><button type="button">Breathwork</button><button type="button">Meditation</button>
                </div>
                <div className={styles.libraryCount}><span>Practice library</span><strong>15 practices</strong></div>
                <div className={styles.practiceList}>
                  <div><span className={styles.practiceGlyph}><SystemIcon name="audio" /></span><span><small>Deeper, Slower, Easier · 12 min</small><strong>Soft Landing</strong></span><button type="button" aria-label="Play Soft Landing"><SystemIcon name="play" /></button></div>
                  <div><span className={styles.practiceGlyph}><SystemIcon name="spark" /></span><span><small>Prāna Fusion · 8 min</small><strong>Circuit Builder</strong></span><span className={styles.nearStatus}><SystemIcon name="lock" /> Paid</span></div>
                </div>
              </div>
            </article>

            <article id="combo-settings" className={styles.combinationCase}>
              <CaseHeader number="03" title="Settings & account" copy="Modal shell, segmented controls, fields, and preferences." />
              <div className={`${styles.productMockup} ${styles.settingsMockup}`}>
                <div className={styles.modalTopline}><div><span className={styles.microLabel}>The User Manual</span><h3>Settings</h3></div><button className={styles.circleControl} type="button" aria-label="Close settings"><SystemIcon name="close" /></button></div>
                <SegmentedControl labels={["Home", "Account", "Creator"]} selected="Account" />
                <label className={styles.nearField}><span>Email address</span><input readOnly value="hello@yogawithethan.com" /></label>
                <div className={styles.preferenceCard}>
                  <span><strong>Gentle reminders</strong><small>Email me when it is time to continue.</small></span>
                  <button type="button" role="switch" aria-checked="true"><i /></button>
                </div>
                <button className={styles.nearPrimary} type="button">Save preferences</button>
              </div>
            </article>

            <article id="combo-purchase" className={styles.combinationCase}>
              <CaseHeader number="04" title="Purchase & completion" copy="Offer frame, benefits, success notice, and next action." />
              <div className={`${styles.productMockup} ${styles.purchaseMockup}`}>
                <div className={styles.purchaseTopline}>
                  <span className={styles.purchaseIcon}><SystemIcon name="lotus" /></span>
                  <span><small>Lifetime companion</small><strong>Everything, forever.</strong></span>
                  <b>$144</b>
                </div>
                <div className={styles.benefitGrid}>
                  <span><SystemIcon name="book" /><small>5 tutorials</small></span>
                  <span><SystemIcon name="audio" /><small>40+ audios</small></span>
                  <span><SystemIcon name="chat" /><small>Questions</small></span>
                </div>
                <div className={styles.completionNotice}>
                  <span className={styles.completionSeal}><SystemIcon name="seal-check" /></span>
                  <span><small>Tutorial complete</small><strong>Prāna Fusion is unlocked.</strong></span>
                  <span className={styles.nearStatus}>New</span>
                </div>
                <button className={styles.nearPrimary} type="button">Unlock full access <SystemIcon name="arrow-right" /></button>
              </div>
            </article>
          </div>
        </section>

        <section id="tags" className={styles.section}>
          <SectionHeading eyebrow="03 · Refined direction" title="Tags and filter chips" copy="The new middle option is deliberately only a fraction less round than a pill. Its ends remain soft while the upper and lower shoulders flatten just enough to echo the expressive card squircle." />
          <div className={styles.tagGrid}>
            {tagOptions.map((option) => (
              <article className={styles.tagOption} key={option.id}>
                <div className={styles.tagOptionHeader}>
                  <div><h3>{option.name}</h3><p>{option.note}</p></div>
                  <code>{option.token}</code>
                </div>
                <div className={`${styles.tagRail} ${styles[`tags_${option.id}`]}`} aria-label={`${option.name} examples`}>
                  <button type="button" data-selected>All</button>
                  <button type="button">Audio</button>
                  <button type="button">Breathwork</button>
                  <button type="button">Flexibility</button>
                  <button type="button">Meditation</button>
                </div>
                <div className={`${styles.stateTags} ${styles[`tags_${option.id}`]}`}>
                  <span data-tone="free">Free</span>
                  <span data-tone="paid">Paid</span>
                  <span data-tone="complete"><SystemIcon name="check" /> Complete</span>
                  <span data-tone="locked"><SystemIcon name="lock" /> Locked</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="tokens" className={styles.section}>
          <SectionHeading eyebrow="04 · After approval" title="How the choice becomes systemic" copy="The selected family will replace scattered radius values with semantic shape tokens. Unique practice-world colors and typography stay untouched." />
          <div className={styles.tokenFrame}>
            <div><code>--shape-frame</code><span>Modals, purchase frames, settings, hero cards</span></div>
            <div><code>--shape-card</code><span>Lessons, practices, notices, empty states</span></div>
            <div><code>--shape-control</code><span>Inputs, segmented controls, compact actions</span></div>
            <div><code>--shape-tag</code><span>Filters, chips, status labels</span></div>
            <div><code>--shape-icon</code><span>Stays circular for locks, play, settings, and badges</span></div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <header className={styles.sectionHeading}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2>{title}</h2>
      <p>{copy}</p>
    </header>
  );
}

function CaseHeader({ number, title, copy }: { number: string; title: string; copy: string }) {
  return (
    <header className={styles.caseHeader}>
      <span>{number}</span>
      <div><h3>{title}</h3><p>{copy}</p></div>
    </header>
  );
}

function SegmentedControl({ labels, selected, compact = false }: { labels: string[]; selected: string; compact?: boolean }) {
  return (
    <div className={styles.segmented} data-compact={compact || undefined}>
      {labels.map((label) => <button type="button" data-selected={label === selected || undefined} key={label}>{label}</button>)}
    </div>
  );
}
