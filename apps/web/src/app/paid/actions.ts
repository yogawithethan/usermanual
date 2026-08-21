"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getUserManualEntitlement } from "@/lib/entitlements";
import { USER_MANUAL_LEGAL_VERSION, USER_MANUAL_PRIVACY_VERSION } from "@/lib/legal";
import { createUserManualCheckoutSession, getStripeReadiness } from "@/lib/stripe";

export async function startUserManualCheckout(formData: FormData) {
  const feature = String(formData.get("feature") ?? "full-tutorial");
  const termsAccepted = formData.get("terms_accepted") === "yes";
  const termsVersion = String(formData.get("terms_version") ?? "");
  const privacyVersion = String(formData.get("privacy_version") ?? "");
  if (!termsAccepted || termsVersion !== USER_MANUAL_LEGAL_VERSION || privacyVersion !== USER_MANUAL_PRIVACY_VERSION) {
    redirect(`/paid?feature=${encodeURIComponent(feature)}&error=terms`);
  }
  const { email, entitled, isPreview, realSignedIn, signedIn, userId } =
    await getUserManualEntitlement();

  if (!signedIn || !userId) {
    redirect(
      `/login?next=${encodeURIComponent(`/paid?feature=${encodeURIComponent(feature)}`)}`,
    );
  }

  if (entitled) {
    redirect("/paid/success?already=1");
  }

  const headerStore = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    `${headerStore.get("x-forwarded-proto") ?? "http"}://${headerStore.get("host")}`;

  // The local access preview has no canonical YWE member identity. It may open
  // a Stripe *test* Checkout for visual QA, but must never mint a live purchase
  // that cannot be attached to a real member account.
  if (isPreview && !realSignedIn) {
    const readiness = getStripeReadiness();
    if (readiness.mode !== "test") {
      redirect(
        `/paid?feature=${encodeURIComponent(feature)}&error=preview-checkout-unconfigured`,
      );
    }

    const session = await createUserManualCheckoutSession({
      feature,
      origin,
      userEmail: process.env.USER_MANUAL_DEV_CHECKOUT_EMAIL,
      userId,
    });
    if (!session.url) {
      throw new Error("Stripe did not return a Checkout URL.");
    }
    redirect(session.url);
  }

  // ONE TILL (ywe docs/SPEC_STORE.md §6.6). The tutorial used to mint its own
  // Stripe Checkout session through the worker, which meant the User Manual
  // could be sold by two paths that did not know about each other. It now hands
  // off to the unified checkout, which prices it, takes the money, and fulfils
  // through fulfilProductAssets — the same `purchased:user_manual` tag this
  // path already relied on, reached by one route instead of two.
  //
  // Everything above is unchanged: the terms gate, the sign-in redirect and the
  // already-entitled short-circuit are this page's contract and still run here.
  const checkoutOrigin = process.env.NEXT_PUBLIC_YWE_ACCOUNT_ORIGIN ?? "https://my.yogawithethan.com";
  const params = new URLSearchParams({
    buy: "user-manual",
    from: "tutorial",
    return: origin,
  });
  redirect(`${checkoutOrigin.replace(/\/+$/, "")}/checkout?${params.toString()}`);
}
