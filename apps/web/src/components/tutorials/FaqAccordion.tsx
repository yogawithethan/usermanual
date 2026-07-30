"use client";

import { useState } from "react";

import { renderMarkdownInline } from "./MarkdownInline";
import styles from "./FaqAccordion.module.css";

interface FaqItem {
  answer: string;
  question: string;
}

interface FaqAccordionProps {
  accent: string;
  bodyFont: string;
  items: FaqItem[];
}

export function FaqAccordion({ accent, bodyFont, items }: FaqAccordionProps) {
  const [openQuestion, setOpenQuestion] = useState(items[0]?.question ?? "");

  return (
    <div className={`${styles.root} shape-card`}>
      {items.map((item) => {
        const isOpen = openQuestion === item.question;

        return (
          <section className={styles.item} key={item.question}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenQuestion(isOpen ? "" : item.question)}
              className={styles.question}
            >
              <span
                className={styles.label}
                style={{ fontFamily: bodyFont }}
              >
                {renderMarkdownInline(item.question, [], "faq-question")}
              </span>
              <span
                className={`${styles.toggle} ${isOpen ? styles.open : ""}`}
                style={{ color: accent }}
                aria-hidden
              >
                <span className={`${styles.toggleLine} ${styles.lineHorizontal}`} />
                <span className={`${styles.toggleLine} ${styles.lineVertical}`} />
              </span>
            </button>
            <div
              className={`${styles.answerGrid} ${isOpen ? styles.answerGridOpen : ""}`}
            >
              <div className={styles.answerInner}>
                <p className={styles.answer}>
                  {renderMarkdownInline(item.answer, [], "faq-answer")}
                </p>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
