"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getUserManualEntitlement } from "@/lib/entitlements";
import { USER_MANUAL_LEGAL_VERSION, USER_MANUAL_PRIVACY_VERSION } from "@/lib/legal";
import { callYweMemberApi } from "@/lib/ywe-member-api";
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

  const response = await callYweMemberApi("/api/stripe/user-manual/checkout", {
    body: JSON.stringify({
      feature,
      origin,
      privacyVersion,
      termsAccepted,
      termsVersion,
    }),
    method: "POST",
  });
  const session = (await response.json().catch(() => ({}))) as { url?: string; error?: string };

  if (!response.ok || !session.url) {
    throw new Error(session.error ?? "Stripe did not return a Checkout URL.");
  }

  redirect(session.url);
}
