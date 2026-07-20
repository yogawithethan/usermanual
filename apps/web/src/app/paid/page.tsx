import Link from "next/link";

import { YwePasswordlessAccess } from "@/components/auth/YwePasswordlessAccess";
import { ButtonLink } from "@/components/ui/System";
import { getUserManualEntitlement } from "@/lib/entitlements";
import { USER_MANUAL_PRICE_LABEL } from "@/lib/purchaseContract";
import { ThemeProvider } from "@/themes/ThemeProvider";
import { dseTheme } from "@/themes/dse";

import { CheckoutHandoff } from "./CheckoutHandoff";

interface PaidPageProps {
  searchParams: Promise<{
    error?: string;
    feature?: string;
  }>;
}

function PurchaseShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={dseTheme} className="flex-1">
      <main
        className="flex min-h-[100dvh] items-center justify-center px-5 py-10"
        style={{ background: "var(--theme-color-surface)" }}
      >
        <section className="shape-frame relative w-full max-w-[460px] overflow-hidden border border-white/80 bg-white/75 px-6 py-7 shadow-[0_18px_45px_rgba(12,19,45,0.12)] backdrop-blur-xl">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[url('/textures/lifetime-offer-pearl.png')] bg-cover bg-center opacity-55"
          />
          {children}
        </section>
      </main>
    </ThemeProvider>
  );
}

export default async function PaidPage({ searchParams }: PaidPageProps) {
  const params = await searchParams;
  const feature = params.feature ?? "full-tutorial";
  const entitlement = await getUserManualEntitlement();
  const returnTo = `/paid?feature=${encodeURIComponent(feature)}`;

  if (entitlement.entitled) {
    return (
      <PurchaseShell>
        <p className="text-center font-[var(--ui-font-eyebrow)] text-[12px] font-bold uppercase tracking-[0.16em] text-[#6B655E]">
          Lifetime access
        </p>
        <h1 className="mt-3 text-balance text-center font-[var(--ui-font-display)] text-[34px] font-bold leading-tight text-[#171411]">
          The User Manual is unlocked.
        </h1>
        <div className="mt-7">
          <ButtonLink href="/" size="large" fullWidth>Return to The User Manual</ButtonLink>
        </div>
      </PurchaseShell>
    );
  }

  if (!entitlement.signedIn) {
    return (
      <PurchaseShell>
        <Link
          href="/"
          className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#1E293B] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(12,19,45,0.08)]"
          aria-label="Back to The User Manual"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <p className="text-center font-[var(--ui-font-eyebrow)] text-[12px] font-bold uppercase tracking-[0.16em] text-[#6B655E]">
          {USER_MANUAL_PRICE_LABEL} · one payment
        </p>
        <div className="mt-4">
          <YwePasswordlessAccess next={returnTo} />
        </div>
      </PurchaseShell>
    );
  }

  if (params.error === "preview-checkout-unconfigured") {
    return (
      <PurchaseShell>
        <p className="text-center font-[var(--ui-font-eyebrow)] text-[12px] font-bold uppercase tracking-[0.16em] text-[#6B655E]">
          Development preview
        </p>
        <h1 className="mt-3 text-balance text-center font-[var(--ui-font-display)] text-[31px] font-bold leading-tight text-[#171411]">
          The signed-in purchase path is working.
        </h1>
        <p className="mx-auto mt-4 max-w-[350px] text-balance text-center text-[14px] leading-6 text-[#6B655E]">
          A real member goes directly to Stripe here. This preview has no member identity, and no Stripe test key is configured, so it cannot safely create a charge.
        </p>
        <div className="mt-7">
          <ButtonLink href="/" variant="secondary" size="large" fullWidth>Back</ButtonLink>
        </div>
      </PurchaseShell>
    );
  }

  if (!entitlement.purchaseEnabled) {
    return (
      <PurchaseShell>
        <h1 className="text-balance text-center font-[var(--ui-font-display)] text-[31px] font-bold leading-tight text-[#171411]">
          Checkout is opening soon.
        </h1>
        <p className="mt-4 text-balance text-center text-[14px] leading-6 text-[#6B655E]">
          Your Yoga With Ethan account is connected. Your free sequence is ready to continue.
        </p>
        <div className="mt-7">
          <ButtonLink href="/" variant="secondary" size="large" fullWidth>Back</ButtonLink>
        </div>
      </PurchaseShell>
    );
  }

  return (
    <PurchaseShell>
      <p className="text-center font-[var(--ui-font-eyebrow)] text-[12px] font-bold uppercase tracking-[0.16em] text-[#6B655E]">
        The User Manual · {USER_MANUAL_PRICE_LABEL}
      </p>
      <h1 className="mt-3 text-balance text-center font-[var(--ui-font-display)] text-[31px] font-bold leading-tight text-[#171411]">
        One payment. Yours forever.
      </h1>
      <p className="mx-auto mt-3 max-w-[350px] text-balance text-center text-[13px] leading-5 text-[#6B655E]">
        Continuing confirms the <Link className="font-semibold underline" href="/terms">Terms</Link>, <Link className="font-semibold underline" href="/privacy">Privacy</Link>, and <Link className="font-semibold underline" href="/refunds">Refund</Link> policies.
      </p>
      <div className="mt-7">
        <CheckoutHandoff feature={feature} />
      </div>
    </PurchaseShell>
  );
}
