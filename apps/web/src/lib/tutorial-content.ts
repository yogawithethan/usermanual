import { getTutorial, type TutorialFaq } from "@islands/content";

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

export async function getPublishedTutorial(level: string | number) {
  const fallback = getTutorial(level);

  if (!fallback) {
    return undefined;
  }

  return { ...fallback, faqs: fallback.faqs ?? DEFAULT_FAQS };
}
