import { NextResponse } from "next/server";

import { getStripeReadiness } from "@/lib/stripe";

export async function GET() {
  const readiness = getStripeReadiness();
  const ready =
    readiness.hasSecretKey &&
    readiness.hasWebhookSecret &&
    readiness.hasPriceId &&
    (process.env.NODE_ENV !== "production" || readiness.hasLiveSecretKey);

  return NextResponse.json(
    {
      ready,
      stripe: readiness,
    },
    { status: ready ? 200 : 503 },
  );
}
