import Link from "next/link";

import { ThemeProvider } from "@/themes/ThemeProvider";
import { dseTheme } from "@/themes/dse";
import { safeWelcomeNext } from "@/lib/welcome";
import { completeWelcome } from "./actions";

interface WelcomePageProps {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
}

export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  const params = await searchParams;
  const next = safeWelcomeNext(params.next);

  return (
    <ThemeProvider theme={dseTheme} className="flex-1">
      <main
        className="flex min-h-[100dvh] items-center justify-center px-5 py-10"
        style={{ background: "var(--theme-color-surface)" }}
      >
        <section className="shape-frame w-full max-w-[720px] overflow-hidden bg-white shadow-[0_18px_45px_rgba(12,19,45,0.12)] ring-1 ring-black/5">
          <div className="flex aspect-video items-center justify-center bg-[#111111] text-white">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#111111] shadow-[0_10px_28px_rgba(0,0,0,0.25)]">
              <svg viewBox="0 0 24 24" className="h-7 w-7 translate-x-[2px]" fill="currentColor" aria-hidden>
                <path d="M8 5.5v13l11-6.5-11-6.5z" />
              </svg>
            </span>
          </div>
          <div className="px-6 py-7 text-center md:px-10">
            <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
              The User Manual
            </p>
            <h1
              className="mt-2 text-[38px] font-bold leading-none text-[#111111] md:text-[48px]"
              style={{ fontFamily: "var(--theme-font-heading)" }}
            >
              Welcome
            </h1>
            <p className="mx-auto mt-4 max-w-[560px] text-[18px] leading-7 text-[#536071]">
              This free introduction is the beginning of your journey. Finish it
              here, then create or open your account to begin Level 1.
            </p>
            {params.error ? (
              <p className="shape-card mx-auto mt-5 max-w-[560px] bg-[#FFF1F2] px-4 py-3 text-[14px] font-semibold text-[#B42318]">
                {params.error}
              </p>
            ) : null}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <form action={completeWelcome}>
                <input type="hidden" name="next" value={next} />
                <button
                  type="submit"
                  className="shape-control flex h-12 w-full items-center justify-center bg-[#1E68B6] px-6 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(30,104,182,0.24)]"
                >
                  Finish welcome &amp; start Level 1
                </button>
              </form>
              <Link
                href="/"
                transitionTypes={["nav-back"]}
                className="shape-control flex h-12 items-center justify-center bg-[#F5F8FC] px-6 text-[16px] font-bold text-[#1E293B] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(12,19,45,0.08)]"
              >
                Back to roadmap
              </Link>
            </div>
          </div>
        </section>
      </main>
    </ThemeProvider>
  );
}
