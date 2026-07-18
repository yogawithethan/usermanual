import { NextResponse } from "next/server";

import { getUserManualEntitlement } from "@/lib/entitlements";
import {
  allowedMobileCheckoutReturnTo,
  defaultMobileCheckoutReturnTo,
} from "@/lib/mobile-checkout";
import { createClient } from "@/lib/supabase/server";
import { createUserManualCheckoutSession } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { entitled, userId } = await getUserManualEntitlement();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (entitled) {
    return NextResponse.json({ alreadyEntitled: true, url: null });
  }

  const body = await request.json().catch(() => ({}));
  const feature = String(body.feature ?? "mobile-unlock");
  const successReturnTo = String(
    body.successReturnTo ?? defaultMobileCheckoutReturnTo("success"),
  );
  const cancelReturnTo = String(body.cancelReturnTo ?? defaultMobileCheckoutReturnTo("cancel"));

  if (
    !allowedMobileCheckoutReturnTo(successReturnTo) ||
    !allowedMobileCheckoutReturnTo(cancelReturnTo)
  ) {
    return NextResponse.json({ error: "Unsupported mobile checkout return URL" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userEmail = claimsData?.claims?.email as string | undefined;
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const successUrl = new URL("/paid/mobile-return", origin);
  successUrl.searchParams.set("status", "success");
  successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
  successUrl.searchParams.set("return_to", successReturnTo);

  const cancelUrl = new URL("/paid/mobile-return", origin);
  cancelUrl.searchParams.set("status", "cancel");
  cancelUrl.searchParams.set("return_to", cancelReturnTo);

  const session = await createUserManualCheckoutSession({
    cancelUrl: cancelUrl.toString(),
    feature,
    origin,
    successUrl: successUrl.toString(),
    userEmail,
    userId,
  });

  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return a Checkout URL." }, { status: 502 });
  }

  return NextResponse.json({
    alreadyEntitled: false,
    url: session.url,
  });
}
