import { redirect } from "next/navigation";

import { completeOnboarding } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { ThemeProvider } from "@/themes/ThemeProvider";
import { dseTheme } from "@/themes/dse";

interface OnboardingPageProps {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
}

const TIMEZONES = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Asia/Makassar",
  "Asia/Singapore",
  "Australia/Sydney",
];

const GOALS = [
  "Better posture",
  "Less pain or tension",
  "More flexibility",
  "Daily practice rhythm",
  "Breath and nervous system regulation",
  "General curiosity",
];

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login?next=/onboarding");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,timezone,onboarding_completed_at")
    .eq("id", userId)
    .single();

  const next = params.next?.startsWith("/") ? params.next : "/levels/1";

  if (profile?.onboarding_completed_at) {
    redirect(next);
  }

  const timezone =
    profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "America/New_York";

  return (
    <ThemeProvider theme={dseTheme} className="flex-1">
      <main
        className="flex min-h-[100dvh] items-center justify-center px-5 py-10"
        style={{ background: "var(--theme-color-surface)" }}
      >
        <section className="shape-frame w-full max-w-[520px] bg-white px-6 py-7 shadow-[0_18px_45px_rgba(12,19,45,0.12)] ring-1 ring-black/5 md:px-8">
          <p className="text-center text-[13px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
            Yoga With Ethan profile
          </p>
          <h1
            className="mt-2 text-center text-[34px] font-bold leading-none text-[#111111]"
            style={{ fontFamily: "var(--theme-font-heading)" }}
          >
            Set up your practice
          </h1>
          <p className="mx-auto mt-3 max-w-[390px] text-center text-[15px] leading-6 text-[#536071]">
            This helps The User Manual personalize your progress while keeping it connected to your Yoga With Ethan account.
          </p>

          {params.error && (
            <p className="shape-card mt-6 bg-[#FFF1F2] px-4 py-3 text-[14px] font-semibold text-[#B42318]">
              {params.error}
            </p>
          )}

          <form action={completeOnboarding} className="mt-7 space-y-4">
            <input type="hidden" name="next" value={next} />
            <label className="block">
              <span className="text-[13px] font-bold text-[#334155]">Name</span>
              <input
                required
                name="display_name"
                type="text"
                defaultValue={profile?.display_name ?? ""}
                autoComplete="name"
                className="shape-control mt-2 h-12 w-full border border-[#D6D9DE] bg-white px-4 text-[16px] text-[#111111] outline-none focus:border-[#1E68B6] focus:ring-4 focus:ring-[#1E68B6]/12"
              />
            </label>

            <label className="block">
              <span className="text-[13px] font-bold text-[#334155]">Timezone</span>
              <select
                name="timezone"
                defaultValue={timezone}
                className="shape-control mt-2 h-12 w-full border border-[#D6D9DE] bg-white px-4 text-[16px] text-[#111111] outline-none focus:border-[#1E68B6] focus:ring-4 focus:ring-[#1E68B6]/12"
              >
                {TIMEZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[13px] font-bold text-[#334155]">Primary goal</span>
              <select
                name="primary_goal"
                defaultValue=""
                className="shape-control mt-2 h-12 w-full border border-[#D6D9DE] bg-white px-4 text-[16px] text-[#111111] outline-none focus:border-[#1E68B6] focus:ring-4 focus:ring-[#1E68B6]/12"
              >
                <option value="">Choose one</option>
                {GOALS.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[13px] font-bold text-[#334155]">What brought you here?</span>
              <textarea
                name="onboarding_note"
                rows={3}
                className="shape-card mt-2 w-full resize-none border border-[#D6D9DE] bg-white px-4 py-3 text-[16px] text-[#111111] outline-none focus:border-[#1E68B6] focus:ring-4 focus:ring-[#1E68B6]/12"
              />
            </label>

            <button
              type="submit"
              className="shape-control h-12 w-full bg-[#1E68B6] px-5 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(30,104,182,0.24)]"
            >
              Begin Level 1
            </button>
          </form>
        </section>
      </main>
    </ThemeProvider>
  );
}
