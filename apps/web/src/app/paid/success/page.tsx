import Link from "next/link";

import { getUserManualEntitlement } from "@/lib/entitlements";
import { ThemeProvider } from "@/themes/ThemeProvider";
import { dseTheme } from "@/themes/dse";

export default async function PaidSuccessPage() {
  const { entitled, userId } = await getUserManualEntitlement();
  const isPending = Boolean(userId && !entitled);

  return (
    <ThemeProvider theme={dseTheme} className="flex-1">
      <main
        className="flex min-h-[100dvh] items-center justify-center px-5 py-10"
        style={{ background: "var(--theme-color-surface)" }}
      >
        <section className="shape-frame w-full max-w-[460px] bg-white px-6 py-7 text-center shadow-[0_18px_45px_rgba(12,19,45,0.12)] ring-1 ring-black/5">
          <span
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(12,19,45,0.08)] ${
              entitled ? "bg-[#EEFDF3] text-[#166534]" : "bg-[#FFF7DF] text-[#9A6500]"
            }`}
          >
            {entitled ? (
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.6}
                aria-hidden
              >
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.4}
                aria-hidden
              >
                <path d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            )}
          </span>
          <h1
            className="mt-5 text-[32px] font-bold leading-none text-[#111111]"
            style={{ fontFamily: "var(--theme-font-heading)" }}
          >
            {entitled ? "Companion unlocked" : "Unlock processing"}
          </h1>
          <p className="mt-4 text-[17px] leading-7 text-[#536071]">
            {entitled
              ? "Your User Manual purchase is connected to your Yoga With Ethan account. Practice, FAQs, downloads, and future creations unlock on this account."
              : isPending
                ? "Stripe accepted the payment return, and Yoga With Ethan is waiting for the secure webhook confirmation before granting access. This usually takes a few seconds."
                : "Sign in with the Yoga With Ethan email you used at checkout to confirm access."}
          </p>
          <div className="mt-7 flex flex-col gap-3">
            <Link
              href={entitled ? "/" : "/paid/success"}
              transitionTypes={entitled ? ["nav-back"] : ["nav-forward"]}
              className="shape-control flex h-12 items-center justify-center bg-[#1E68B6] px-6 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(30,104,182,0.24)]"
            >
              {entitled ? "Back to roadmap" : "Check again"}
            </Link>
            {!entitled && (
              <Link
                href={userId ? "/profile" : "/login?next=/paid/success"}
                transitionTypes={["nav-forward"]}
                className="shape-control flex h-12 items-center justify-center bg-[#F5F8FC] px-6 text-[16px] font-bold text-[#1E293B] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(12,19,45,0.08)]"
              >
                {userId ? "Open profile" : "Log in with email"}
              </Link>
            )}
          </div>
        </section>
      </main>
    </ThemeProvider>
  );
}
