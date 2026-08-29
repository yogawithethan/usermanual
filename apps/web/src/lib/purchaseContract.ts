export const USER_MANUAL_PRICE_CENTS = 14_400;
export const USER_MANUAL_PRICE_LABEL = "$144";
// Pre-launch preorder price — must match the `preorder` variant on the
// `user-manual` offerings row (ywe docs/SPEC_USER_MANUAL_COMING_SOON.md).
export const USER_MANUAL_PREORDER_PRICE_CENTS = 9_000;
export const USER_MANUAL_PREORDER_PRICE_LABEL = "$90";

export const USER_MANUAL_PURCHASE_BENEFITS = [
  {
    title: "Five paid tutorials",
    copy: "Practice worlds become progression-eligible as you complete the Deeper. Slower. Easier. levels. Anything unfinished is clearly marked Coming soon.",
  },
  {
    title: "Practice audios",
    copy: "Over 40 practice audios to turn theory into embodiment.",
  },
  {
    title: "Comments and questions",
    copy: "Read community comments and ask Ethan questions inside the lessons.",
  },
  {
    title: "Downloads and future additions",
    copy: "New User Manual creations included in this offer are yours when they arrive, with optional email or Telegram release notices.",
  },
] as const;
