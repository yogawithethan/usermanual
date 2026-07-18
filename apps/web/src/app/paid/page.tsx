import Link from "next/link";
import { practiceUniverses } from "@islands/content";

import { getUserManualEntitlement } from "@/lib/entitlements";
import { ThemeProvider } from "@/themes/ThemeProvider";
import { dseTheme } from "@/themes/dse";
import { startUserManualCheckout } from "./actions";

interface PaidPageProps {
  searchParams: Promise<{
    feature?: string;
  }>;
}

const FEATURE_LABELS: Record<string, string> = {
  comments: "Community questions",
  downloads: "Downloads",
  faqs: "FAQs",
  "full-tutorial": "Full Tutorial",
  practice: "Practice library",
  ...Object.fromEntries(
    practiceUniverses.map((universe) => [universe.slug, universe.title]),
  ),
};

export default async function PaidPage({ searchParams }: PaidPageProps) {
  const params = await searchParams;
  const feature = FEATURE_LABELS[params.feature ?? ""] ?? "This feature";
  const featureParam = params.feature ?? "full-tutorial";
  const { entitled, userId } = await getUserManualEntitlement();

  return (
    <ThemeProvider theme={dseTheme} className="flex-1">
      <main
        className="flex min-h-[100dvh] items-center justify-center px-5 py-10"
        style={{ background: "var(--theme-color-surface)" }}
      >
        <section className="shape-frame w-full max-w-[460px] bg-white px-6 py-7 text-center shadow-[0_18px_45px_rgba(12,19,45,0.12)] ring-1 ring-black/5">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF7DF] text-[#9A6500] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(12,19,45,0.08)]">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.3 7.2 18l.9-5.4-3.9-3.8 5.4-.8L12 3z" />
            </svg>
          </span>
          <h1
            className="mt-5 text-[32px] font-bold leading-none text-[#111111]"
            style={{ fontFamily: "var(--theme-font-heading)" }}
          >
            Paid companion
          </h1>
          <p className="mt-4 text-[17px] leading-7 text-[#536071]">
            {entitled
              ? `${feature} is unlocked on your Yoga With Ethan account.`
              : `${feature} is part of the $144 User Manual companion. Your purchase will include future User Manual creations as they are added.`}
          </p>
          <div className="mt-7 flex flex-col gap-3">
            {entitled ? (
              <Link
                href="/"
                transitionTypes={["nav-back"]}
                className="shape-control flex h-12 items-center justify-center bg-[#1E68B6] px-6 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(30,104,182,0.24)]"
              >
                Back to roadmap
              </Link>
            ) : userId ? (
              <form action={startUserManualCheckout}>
                <input type="hidden" name="feature" value={featureParam} />
                <button
                  type="submit"
                  className="rainbow-fill shape-control flex h-12 w-full items-center justify-center px-6 text-[16px] font-bold text-white"
                >
                  Unlock for $144
                </button>
              </form>
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent(`/paid?feature=${encodeURIComponent(featureParam)}`)}`}
                transitionTypes={["nav-forward"]}
                className="shape-control flex h-12 items-center justify-center bg-[#1E68B6] px-6 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(30,104,182,0.24)]"
              >
                Sign in to unlock
              </Link>
            )}
            {!entitled && (
              <Link
                href="/"
                transitionTypes={["nav-back"]}
                className="shape-control flex h-12 items-center justify-center bg-[#F5F8FC] px-6 text-[16px] font-bold text-[#1E293B] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(12,19,45,0.08)]"
              >
                Back to roadmap
              </Link>
            )}
          </div>
        </section>
      </main>
    </ThemeProvider>
  );
}
