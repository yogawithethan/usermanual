import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Checkout · The User Manual",
  description: "Purchase lifetime access to The User Manual by Yoga with Ethan.",
  robots: { index: false, follow: false },
};

// This route used to iframe live.yogawithethan.com/register?product=user-manual&review=1
// — the synthetic PREVIEW checkout, which was designed but never wired to a
// till. That made three paths to one product, none of which knew about the
// others. It is a redirect to the real checkout now.
//
// Kept as a redirect rather than deleted so any bookmark or shared link still
// lands somewhere that can actually take the money.
// See ywe docs/SPEC_STORE.md §6.6.
const CHECKOUT_ORIGIN =
  process.env.NEXT_PUBLIC_YWE_ACCOUNT_ORIGIN ?? "https://my.yogawithethan.com";

export default async function CheckoutPage() {
  const params = new URLSearchParams({
    buy: "user-manual",
    from: "tutorial",
    return: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tutorial.yogawithethan.com",
  });
  redirect(`${CHECKOUT_ORIGIN.replace(/\/+$/, "")}/checkout?${params.toString()}`);
}
