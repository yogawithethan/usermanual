"use client";

import { useId, useState, type CSSProperties } from "react";

import { renderMarkdownInline } from "@/components/tutorials/MarkdownInline";

import styles from "./HomeLibraryViews.module.css";

interface FaqAnswer {
  answer: string;
  question: string;
}

interface FaqWorldAccordionProps {
  accent: string;
  answers: FaqAnswer[];
  ink: string;
  logo: string;
  surface: string;
  title: string;
}

export function FaqWorldAccordion({ accent, answers, ink, logo, surface, title }: FaqWorldAccordionProps) {
  const [open, setOpen] = useState(false);
  const [openAnswer, setOpenAnswer] = useState<number | null>(null);
  const contentId = useId();

  return (
    <section
      className={styles.worldGroup}
      data-expanded={open}
      style={{
        "--library-accent": accent,
        "--library-surface": surface,
        "--library-ink": ink,
      } as CSSProperties}
    >
      <button
        aria-controls={contentId}
        aria-expanded={open}
        className={styles.worldHeader}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span
          aria-hidden
          className={styles.worldLogo}
          style={{ maskImage: `url('${logo}')`, WebkitMaskImage: `url('${logo}')` }}
        />
        <span className={styles.worldMeta}>{answers.length} answers</span>
        <span aria-hidden className={styles.turningPlus}><i /><i /></span>
        <span className="sr-only">{open ? `Collapse ${title}` : `Expand ${title}`}</span>
      </button>

      <div aria-hidden={!open} className={styles.worldReveal} data-open={open} id={contentId}>
        <div className={styles.worldRevealInner}>
          <div className={styles.faqList}>
            {answers.map((faq, index) => {
              const answerOpen = openAnswer === index;
              const answerId = `${contentId}-answer-${index}`;
              return (
                <section className={styles.faq} data-open={answerOpen} key={faq.question}>
                  <button
                    aria-controls={answerId}
                    aria-expanded={answerOpen}
                    onClick={() => setOpenAnswer(answerOpen ? null : index)}
                    type="button"
                  >
                    <span>{renderMarkdownInline(faq.question, [], `library-faq-question-${index}`)}</span>
                    <span aria-hidden className={styles.turningPlus}><i /><i /></span>
                  </button>
                  <div aria-hidden={!answerOpen} className={styles.answerReveal} data-open={answerOpen} id={answerId}>
                    <div><p>{renderMarkdownInline(faq.answer, [], `library-faq-answer-${index}`)}</p></div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
