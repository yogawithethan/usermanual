import Link from "next/link";
import { redirect } from "next/navigation";

import { callYweMemberApi, getYweMemberSession } from "@/lib/ywe-member-api";
import { ThemeProvider } from "@/themes/ThemeProvider";
import { dseTheme } from "@/themes/dse";

interface ProfilePageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;
  const session = await getYweMemberSession();
  if (!session.signedIn) {
    redirect("/login?next=/profile");
  }
  const email = session.member?.email ?? "";
  const displayName = session.member?.displayName ?? "";
  const entitlement = Boolean(session.access?.entitled);
  const preferencesResponse = await callYweMemberApi("/api/preferences/user-manual-reminders");
  const preferences = preferencesResponse.ok
    ? ((await preferencesResponse.json()) as { emailEnabled: boolean; telegramEnabled: boolean; telegramLinked: boolean })
    : { emailEnabled: false, telegramEnabled: false, telegramLinked: false };

  return (
    <ThemeProvider theme={dseTheme} className="flex-1">
      <main
        className="app-chrome flex min-h-[100dvh] items-center justify-center px-5 py-10"
        style={{ background: "var(--theme-color-surface)" }}
      >
        <div className="w-full max-w-[680px]">
          <Link
            href="/"
            className="mb-5 inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-[14px] font-bold text-[#1E293B] shadow-[0_8px_20px_rgba(12,19,45,0.10)] ring-1 ring-black/5"
          >
            Back to The User Manual
          </Link>

          <section className="rounded-[28px] bg-white px-6 py-7 shadow-[0_18px_45px_rgba(12,19,45,0.12)] ring-1 ring-black/5 md:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
                  Islands profile
                </p>
                <h1
                  className="app-display mt-2 text-[38px] font-bold leading-none text-[#111111]"
                >
                  Account settings
                </h1>
                <p className="mt-3 text-[15px] leading-6 text-[#536071]">
                  These settings belong to your Islands account and carry across connected products.
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F8FC] text-[22px] font-black uppercase text-[#1E293B] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(12,19,45,0.08)]">
                {(displayName || email || "I").slice(0, 1)}
              </div>
            </div>

            {params.error && (
              <p className="mt-6 rounded-[14px] bg-[#FFF1F2] px-4 py-3 text-[14px] font-semibold text-[#B42318]">
                {params.error}
              </p>
            )}

            {params.message && (
              <p className="mt-6 rounded-[14px] bg-[#EEFDF3] px-4 py-3 text-[14px] font-semibold text-[#166534]">
                {params.message}
              </p>
            )}

            <section className="mt-8 rounded-[22px] border border-[#D6D9DE] bg-[#F8FAFC] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
                    Access
                  </p>
                  <h2 className="mt-1 text-[22px] font-bold text-[#111111]">
                    The User Manual
                  </h2>
                  <p className="mt-2 text-[14px] leading-5 text-[#536071]">
                    This is tied to your Islands account, so it follows you across web and future
                    iOS access.
                  </p>
                </div>

                {entitlement ? (
                  <span className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] px-4 text-[14px] font-black text-[#166534]">
                    Unlocked forever
                  </span>
                ) : (
                  <Link
                    href="/paid?feature=profile"
                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#1E68B6] px-4 text-[14px] font-black text-white shadow-[0_10px_24px_rgba(30,104,182,0.22)]"
                  >
                    Unlock for $144
                  </Link>
                )}
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-[18px] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] ring-1 ring-black/5">
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
                    Status
                  </p>
                  <p className="mt-2 text-[16px] font-bold text-[#111111]">
                    {entitlement ? "Active access" : "No purchase yet"}
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-[#536071]">
                    {entitlement
                      ? "Lifetime access is attached to this shared Yoga With Ethan account."
                      : "The welcome section stays free. The library unlock is a one-time purchase."}
                  </p>
                </div>

                <div className="rounded-[18px] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] ring-1 ring-black/5">
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
                    Purchases
                  </p>
                  <p className="mt-2 text-[13px] leading-5 text-[#536071]">
                    {entitlement
                      ? "$144 lifetime companion · active"
                      : "Purchase confirmation will be emailed after checkout."}
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-8 grid gap-7 md:grid-cols-[1fr_1fr]">
              <section className="space-y-4">
                <h2 className="text-[20px] font-bold text-[#111111]">Shared account</h2>
                <div className="rounded-[18px] border border-[#D6D9DE] bg-[#F8FAFC] p-4">
                  <p className="text-[15px] font-bold text-[#111111]">{displayName || "Yoga With Ethan member"}</p>
                  <p className="mt-1 text-[13px] text-[#536071]">{email}</p>
                </div>
                <a
                  href="https://islands.bio/account"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#F5F8FC] px-5 text-[16px] font-bold text-[#1E293B] ring-1 ring-black/5"
                >
                  Manage Islands account
                </a>
              </section>

              <form action={updateReminderPreferences} className="space-y-4">
                <h2 className="text-[20px] font-bold text-[#111111]">Gentle reminders</h2>
                <p className="text-[14px] leading-5 text-[#536071]">
                  Choose how The User Manual may help you continue. Global Yoga With Ethan opt-outs always win.
                </p>
                <label className="flex items-center gap-3 rounded-[16px] border border-[#D6D9DE] p-4 text-[14px] font-bold text-[#334155]">
                  <input name="email_enabled" type="checkbox" defaultChecked={preferences.emailEnabled} />
                  Email reminders and release notices
                </label>
                <label className="flex items-center gap-3 rounded-[16px] border border-[#D6D9DE] p-4 text-[14px] font-bold text-[#334155]">
                  <input
                    name="telegram_enabled"
                    type="checkbox"
                    defaultChecked={preferences.telegramEnabled}
                    disabled={!preferences.telegramLinked}
                  />
                  Telegram reminders
                </label>
                {!preferences.telegramLinked && (
                  <p className="text-[12px] leading-5 text-[#64748B]">
                    Link Telegram to your Yoga With Ethan account before enabling this channel.
                  </p>
                )}
                <button
                  type="submit"
                  className="h-12 w-full rounded-full bg-[#1E68B6] px-5 text-[16px] font-bold text-white shadow-[0_3px_8px_rgba(30,104,182,0.14)]"
                >
                  Save reminder preferences
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </ThemeProvider>
  );
}

async function updateReminderPreferences(formData: FormData) {
  "use server";
  const response = await callYweMemberApi("/api/preferences/user-manual-reminders", {
    body: JSON.stringify({
      emailEnabled: formData.get("email_enabled") === "on",
      telegramEnabled: formData.get("telegram_enabled") === "on",
      pausedUntil: null,
    }),
    method: "PATCH",
  });
  if (!response.ok) redirect("/profile?error=Could%20not%20save%20reminder%20preferences");
  redirect("/profile?message=Reminder%20preferences%20saved");
}
