"use client";

import { useState } from "react";

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
    <div className="shape-card mt-6 divide-y divide-[#E4DED8] overflow-hidden border border-[#E4DED8] bg-white shadow-[0_8px_24px_rgba(12,19,45,0.05)]">
      {items.map((item) => {
        const isOpen = openQuestion === item.question;

        return (
          <section key={item.question}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenQuestion(isOpen ? "" : item.question)}
              className="group flex w-full items-center justify-between gap-5 px-5 py-4 text-left transition-colors hover:bg-[#F8FAFC] focus-visible:bg-[#F8FAFC] focus-visible:outline-none md:px-6"
            >
              <span
                className="text-[18px] font-bold leading-snug text-[#111111] md:text-[21px]"
                style={{ fontFamily: bodyFont }}
              >
                {item.question}
              </span>
              <span
                className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5F8FC] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_3px_9px_rgba(12,19,45,0.08)] transition-colors"
                style={{ color: accent }}
                aria-hidden
              >
                <span
                  className={[
                    "absolute h-[2px] w-3.5 rounded-full bg-current transition-transform duration-200 ease-out",
                    isOpen ? "rotate-45" : "rotate-0",
                  ].join(" ")}
                />
                <span
                  className={[
                    "absolute h-[2px] w-3.5 rounded-full bg-current transition-transform duration-200 ease-out",
                    isOpen ? "-rotate-45" : "rotate-90",
                  ].join(" ")}
                />
              </span>
            </button>
            <div
              className={[
                "grid transition-[grid-template-rows] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              ].join(" ")}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-[18px] leading-[1.55] text-[#536071] md:px-6 md:text-[20px]">
                  {item.answer}
                </p>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
