"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/System";
import {
  USER_MANUAL_LEGAL_VERSION,
  USER_MANUAL_PRIVACY_VERSION,
} from "@/lib/legal";

import { startUserManualCheckout } from "./actions";

export function CheckoutHandoff({ feature }: { feature: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.requestSubmit();
  }, []);

  return (
    <form ref={formRef} action={startUserManualCheckout} className="grid gap-4">
      <input type="hidden" name="feature" value={feature} />
      <input type="hidden" name="terms_accepted" value="yes" />
      <input type="hidden" name="terms_version" value={USER_MANUAL_LEGAL_VERSION} />
      <input type="hidden" name="privacy_version" value={USER_MANUAL_PRIVACY_VERSION} />
      <p className="text-balance text-center text-[14px] leading-6 text-[#6B655E]">
        Opening secure Stripe Checkout…
      </p>
      <Button type="submit" variant="premium" size="large" fullWidth>
        Continue to Stripe
      </Button>
    </form>
  );
}
