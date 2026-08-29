import { USER_MANUAL_PREORDER_PRICE_LABEL, USER_MANUAL_PRICE_LABEL } from "@/lib/purchaseContract";

// Pre-launch gate. Unset means the gate is ON; set NEXT_PUBLIC_USER_MANUAL_COMING_SOON=0
// at launch (step 2 of the flip list in ywe docs/SPEC_USER_MANUAL_COMING_SOON.md).
export function userManualComingSoon() {
  return process.env.NEXT_PUBLIC_USER_MANUAL_COMING_SOON !== "0";
}

// ONE TILL: the preorder sells through the unified checkout, priced server-side
// by the `preorder` variant on the `user-manual` offering row.
export function preorderCheckoutUrl() {
  const origin = process.env.NEXT_PUBLIC_YWE_ACCOUNT_ORIGIN ?? "https://my.yogawithethan.com";
  const params = new URLSearchParams({
    buy: "user-manual",
    variant: "preorder",
    from: "tutorial",
  });
  return `${origin.replace(/\/+$/, "")}/checkout?${params.toString()}`;
}

export const PREORDER_PRICE_LABEL = USER_MANUAL_PREORDER_PRICE_LABEL;
export const FULL_PRICE_LABEL = USER_MANUAL_PRICE_LABEL;
