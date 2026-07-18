"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getUserManualEntitlement } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";
import { createUserManualCheckoutSession } from "@/lib/stripe";

export async function startUserManualCheckout(formData: FormData) {
  const feature = String(formData.get("feature") ?? "full-tutorial");
  const { entitled, userId } = await getUserManualEntitlement();

  if (!userId) {
    redirect(
      `/login?next=${encodeURIComponent(`/paid?feature=${encodeURIComponent(feature)}`)}`,
    );
  }

  if (entitled) {
    redirect("/paid/success?already=1");
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userEmail = claimsData?.claims?.email as string | undefined;
  const headerStore = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    `${headerStore.get("x-forwarded-proto") ?? "http"}://${headerStore.get("host")}`;

  const session = await createUserManualCheckoutSession({
    feature,
    origin,
    userEmail,
    userId,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a Checkout URL.");
  }

  redirect(session.url);
}
