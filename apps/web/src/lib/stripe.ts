import crypto from "node:crypto";

import { USER_MANUAL_PRODUCT_SLUG } from "@/lib/entitlements";

const STRIPE_API_VERSION = "2026-02-25.clover";
const STRIPE_WEBHOOK_TOLERANCE_SECONDS = 300;

export const USER_MANUAL_PRICE_CENTS = 14_400;
export const USER_MANUAL_STRIPE_PRICE_ENV = "STRIPE_USER_MANUAL_PRICE_ID";

export interface StripeCheckoutSession {
  id: string;
  url: string | null;
}

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: StripeCheckoutSessionCompleted;
  };
}

export interface StripeCheckoutSessionCompleted {
  id: string;
  amount_total: number | null;
  currency: string | null;
  metadata?: Record<string, string>;
  payment_intent: string | null;
  payment_status: string;
  total_details?: {
    amount_discount: number;
  } | null;
}

export async function createUserManualCheckoutSession({
  feature,
  cancelUrl,
  origin,
  successUrl,
  userEmail,
  userId,
}: {
  cancelUrl?: string;
  feature: string;
  origin: string;
  successUrl?: string;
  userEmail?: string;
  userId: string;
}) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env[USER_MANUAL_STRIPE_PRICE_ENV];

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  if (process.env.NODE_ENV === "production" && !priceId) {
    throw new Error(`Missing ${USER_MANUAL_STRIPE_PRICE_ENV}.`);
  }

  const body = new URLSearchParams({
    mode: "payment",
    allow_promotion_codes: "true",
    success_url: successUrl ?? `${origin}/paid/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl ?? `${origin}/paid?feature=${encodeURIComponent(feature)}`,
    "line_items[0][quantity]": "1",
    "metadata[user_id]": userId,
    "metadata[product_slug]": USER_MANUAL_PRODUCT_SLUG,
    "metadata[feature]": feature,
    "payment_intent_data[metadata][user_id]": userId,
    "payment_intent_data[metadata][product_slug]": USER_MANUAL_PRODUCT_SLUG,
  });

  if (priceId) {
    body.set("line_items[0][price]", priceId);
  } else {
    body.set("line_items[0][price_data][currency]", "usd");
    body.set("line_items[0][price_data][unit_amount]", String(USER_MANUAL_PRICE_CENTS));
    body.set("line_items[0][price_data][product_data][name]", "The User Manual Companion");
    body.set(
      "line_items[0][price_data][product_data][description]",
      "Practice library, FAQs, downloads, and future User Manual creations.",
    );
  }

  if (userEmail) {
    body.set("customer_email", userEmail);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": STRIPE_API_VERSION,
    },
    body,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Stripe Checkout failed: ${message}`);
  }

  return (await response.json()) as StripeCheckoutSession;
}

export function getStripeReadiness() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const priceId = process.env[USER_MANUAL_STRIPE_PRICE_ENV];

  return {
    apiVersion: STRIPE_API_VERSION,
    hasLiveSecretKey: Boolean(secretKey?.startsWith("sk_live_")),
    hasPriceId: Boolean(priceId),
    hasSecretKey: Boolean(secretKey),
    hasWebhookSecret: Boolean(webhookSecret),
    mode: secretKey?.startsWith("sk_live_") ? "live" : secretKey ? "test" : "missing",
    priceEnv: USER_MANUAL_STRIPE_PRICE_ENV,
  };
}

export function verifyStripeWebhook(payload: string, signatureHeader: string | null) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET.");
  }

  if (!signatureHeader) {
    throw new Error("Missing Stripe signature.");
  }

  const signatures: string[] = [];
  let timestamp: string | undefined;

  for (const part of signatureHeader.split(",")) {
    const [key, value] = part.split("=", 2);

    if (key === "t") {
      timestamp = value;
    }

    if (key === "v1" && value) {
      signatures.push(value);
    }
  }

  if (!timestamp || signatures.length === 0) {
    throw new Error("Invalid Stripe signature format.");
  }

  const timestampSeconds = Number(timestamp);

  if (!Number.isFinite(timestampSeconds)) {
    throw new Error("Invalid Stripe timestamp.");
  }

  const ageSeconds = Math.abs(Date.now() / 1000 - timestampSeconds);

  if (ageSeconds > STRIPE_WEBHOOK_TOLERANCE_SECONDS) {
    throw new Error("Expired Stripe signature.");
  }

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const isVerified = signatures.some((signature) => {
    const signatureBuffer = Buffer.from(signature, "hex");

    return (
      expectedBuffer.length === signatureBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
    );
  });

  if (!isVerified) {
    throw new Error("Invalid Stripe signature.");
  }

  return JSON.parse(payload) as StripeEvent;
}
