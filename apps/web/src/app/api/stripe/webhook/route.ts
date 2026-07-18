import { NextResponse } from "next/server";

import { USER_MANUAL_PRODUCT_SLUG } from "@/lib/entitlements";
import { createServiceClient } from "@/lib/supabase/service";
import { USER_MANUAL_PRICE_CENTS, verifyStripeWebhook } from "@/lib/stripe";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = verifyStripeWebhook(payload, signature);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webhook" },
      { status: 400 },
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;

  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const userId = session.metadata?.user_id;
  const productSlug = session.metadata?.product_slug ?? USER_MANUAL_PRODUCT_SLUG;

  if (!userId || productSlug !== USER_MANUAL_PRODUCT_SLUG) {
    return NextResponse.json(
      { error: "Checkout session missing required metadata." },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  const { data: existingEvent, error: existingEventError } = await supabase
    .from("payment_webhook_events")
    .select("id")
    .eq("id", event.id)
    .maybeSingle();

  if (existingEventError) {
    return NextResponse.json({ error: existingEventError.message }, { status: 500 });
  }

  if (existingEvent) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const providerReference = session.payment_intent ?? session.id;
  const amountCents = session.amount_total ?? 0;
  const discountCents = session.total_details?.amount_discount ?? 0;
  const originalAmountCents = amountCents + discountCents;
  const currency = session.currency ?? "usd";
  const isUserManualAmount =
    originalAmountCents === USER_MANUAL_PRICE_CENTS && amountCents >= 0;

  if (!isUserManualAmount || currency.toLowerCase() !== "usd") {
    return NextResponse.json(
      { error: "Checkout session amount does not match The User Manual purchase." },
      { status: 400 },
    );
  }

  const { error: purchaseError } = await supabase.from("purchases").upsert(
    {
      amount_cents: amountCents,
      currency,
      product_slug: USER_MANUAL_PRODUCT_SLUG,
      provider: "stripe",
      provider_reference: providerReference,
      purchased_at: new Date().toISOString(),
      user_id: userId,
    },
    { onConflict: "provider,provider_reference" },
  );

  if (purchaseError) {
    return NextResponse.json({ error: purchaseError.message }, { status: 500 });
  }

  const { error: entitlementError } = await supabase
    .from("product_entitlements")
    .upsert(
      {
        product_slug: USER_MANUAL_PRODUCT_SLUG,
        source: "stripe",
        source_reference: providerReference,
        starts_at: new Date().toISOString(),
        status: "active",
        user_id: userId,
      },
      { onConflict: "user_id,product_slug,source,source_reference" },
    );

  if (entitlementError) {
    return NextResponse.json({ error: entitlementError.message }, { status: 500 });
  }

  const { error: eventLogError } = await supabase.from("payment_webhook_events").insert({
    event_type: event.type,
    id: event.id,
    provider: "stripe",
    source_reference: providerReference,
  });

  if (eventLogError && eventLogError.code !== "23505") {
    return NextResponse.json({ error: eventLogError.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
