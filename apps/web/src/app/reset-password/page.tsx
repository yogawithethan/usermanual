import Link from "next/link";

import { sendPasswordReset } from "@/app/auth/actions";
import { ThemeProvider } from "@/themes/ThemeProvider";
import { dseTheme } from "@/themes/dse";

interface ResetPasswordPageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <ThemeProvider theme={dseTheme} className="flex-1">
      <main
        className="flex min-h-[100dvh] items-center justify-center px-5 py-10"
        style={{ background: "var(--theme-color-surface)" }}
      >
        <section className="shape-frame w-full max-w-[420px] bg-white px-6 py-7 shadow-[0_18px_45px_rgba(12,19,45,0.12)] ring-1 ring-black/5">
          <Link
            href="/login"
            className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F8FC] text-[#1E293B] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(12,19,45,0.08)]"
            aria-label="Back to login"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.4"
              aria-hidden
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>

          <div className="text-center">
            <h1
              className="text-[34px] font-bold leading-none text-[#111111]"
              style={{ fontFamily: "var(--theme-font-heading)" }}
            >
              Reset password
            </h1>
            <p className="mt-3 text-[15px] leading-6 text-[#536071]">
              Yoga With Ethan uses secure email links, so there is no password to reset.
            </p>
          </div>

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

          <form action={sendPasswordReset} className="mt-7 space-y-4">
            <label className="block">
              <span className="text-[13px] font-bold text-[#334155]">Email</span>
              <input
                required
                name="email"
                type="email"
                autoComplete="email"
                className="shape-control mt-2 h-12 w-full border border-[#D6D9DE] bg-white px-4 text-[16px] text-[#111111] outline-none focus:border-[#1E68B6] focus:ring-4 focus:ring-[#1E68B6]/12"
              />
            </label>
            <button
              type="submit"
              className="shape-control h-12 w-full bg-[#1E68B6] px-5 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(30,104,182,0.24)]"
            >
              Send reset link
            </button>
          </form>
        </section>
      </main>
    </ThemeProvider>
  );
}
