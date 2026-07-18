import Link from "next/link";
import { ThemeProvider } from "@/themes/ThemeProvider";
import { dseTheme } from "@/themes/dse";
import { YwePasswordlessAccess } from "@/components/auth/YwePasswordlessAccess";

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") ? params.next : "/";

  return (
    <ThemeProvider theme={dseTheme} className="flex-1">
      <main
        className="flex min-h-[100dvh] items-center justify-center px-5 py-10"
        style={{ background: "var(--theme-color-surface)" }}
      >
        <section className="shape-frame w-full max-w-[420px] bg-white px-6 py-7 shadow-[0_18px_45px_rgba(12,19,45,0.12)] ring-1 ring-black/5">
          <Link
            href="/"
            className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F8FC] text-[#1E293B] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(12,19,45,0.08)]"
            aria-label="Back to The User Manual"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>

          {params.error && (
            <p className="shape-card mt-6 bg-[#FFF1F2] px-4 py-3 text-[14px] font-semibold text-[#B42318]">
              {params.error}
            </p>
          )}

          {params.message && (
            <p className="shape-card mt-6 bg-[#EEFDF3] px-4 py-3 text-[14px] font-semibold text-[#166534]">
              {params.message}
            </p>
          )}

          <div className="mt-2">
            <YwePasswordlessAccess next={next} />
          </div>
        </section>
      </main>
    </ThemeProvider>
  );
}
