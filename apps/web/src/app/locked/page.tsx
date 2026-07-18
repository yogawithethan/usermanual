import Link from "next/link";

import { ThemeProvider } from "@/themes/ThemeProvider";
import { dseTheme } from "@/themes/dse";

interface LockedPageProps {
  searchParams: Promise<{
    required?: string;
    type?: string;
  }>;
}

export default async function LockedPage({ searchParams }: LockedPageProps) {
  const params = await searchParams;
  const requiredLevel = Number(params.required ?? 1);
  const isUniverse = params.type === "universe";

  return (
    <ThemeProvider theme={dseTheme} className="flex-1">
      <main
        className="flex min-h-[100dvh] items-center justify-center px-5 py-10"
        style={{ background: "var(--theme-color-surface)" }}
      >
        <section className="shape-frame w-full max-w-[440px] bg-white px-6 py-7 text-center shadow-[0_18px_45px_rgba(12,19,45,0.12)] ring-1 ring-black/5">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F8FC] text-[#64748B] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(12,19,45,0.08)]">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8.5 11V8a3.5 3.5 0 1 1 7 0v3" />
            </svg>
          </span>
          <h1
            className="mt-5 text-[32px] font-bold leading-none text-[#111111]"
            style={{ fontFamily: "var(--theme-font-heading)" }}
          >
            Still locked
          </h1>
          <p className="mt-4 text-[17px] leading-7 text-[#536071]">
            {isUniverse
              ? `This practice universe unlocks after you complete Level ${requiredLevel}.`
              : `Complete Level ${requiredLevel} before opening the next level.`}
          </p>
          <Link
            href="/"
            transitionTypes={["nav-back"]}
            className="shape-control mt-7 flex h-12 items-center justify-center bg-[#1E68B6] px-6 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(30,104,182,0.24)]"
          >
            Back to roadmap
          </Link>
        </section>
      </main>
    </ThemeProvider>
  );
}
