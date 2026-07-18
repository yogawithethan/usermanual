import Link from "next/link";
import { redirect } from "next/navigation";

import { updateProfile } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { ThemeProvider } from "@/themes/ThemeProvider";
import { dseTheme } from "@/themes/dse";

interface ProfilePageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
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

function formatPurchaseAmount(amountCents: number | null, currency: string | null) {
  if (typeof amountCents !== "number") {
    return "Purchase recorded";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  }).format(amountCents / 100);
}

function formatProfileDate(value: string | null) {
  if (!value) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login?next=/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email,display_name,timezone")
    .eq("id", userId)
    .single();

  const email = profile?.email ?? (claimsData?.claims?.email as string | undefined) ?? "";
  const displayName = profile?.display_name ?? "";
  const timezone =
    profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "America/New_York";

  const { data: entitlement } = await supabase
    .from("product_entitlements")
    .select("status,source,starts_at")
    .eq("user_id", userId)
    .eq("product_slug", "the-user-manual")
    .eq("status", "active")
    .maybeSingle();

  const { data: purchases } = await supabase
    .from("purchases")
    .select("amount_cents,currency,purchased_at,provider")
    .eq("user_id", userId)
    .eq("product_slug", "the-user-manual")
    .order("purchased_at", { ascending: false })
    .limit(3);

  return (
    <ThemeProvider theme={dseTheme} className="flex-1">
      <main
        className="flex min-h-[100dvh] items-center justify-center px-5 py-10"
        style={{ background: "var(--theme-color-surface)" }}
      >
        <div className="w-full max-w-[680px]">
          <Link
            href="/"
            className="shape-control mb-5 inline-flex h-10 items-center justify-center bg-white px-4 text-[14px] font-bold text-[#1E293B] shadow-[0_8px_20px_rgba(12,19,45,0.10)] ring-1 ring-black/5"
          >
            Back to The User Manual
          </Link>

          <section className="shape-frame bg-white px-6 py-7 shadow-[0_18px_45px_rgba(12,19,45,0.12)] ring-1 ring-black/5 md:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
                  Yoga With Ethan profile
                </p>
                <h1
                  className="mt-2 text-[34px] font-bold leading-none text-[#111111]"
                  style={{ fontFamily: "var(--theme-font-heading)" }}
                >
                  Account settings
                </h1>
                <p className="mt-3 text-[15px] leading-6 text-[#536071]">
                  These settings belong to your Yoga With Ethan account and carry across connected products.
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F8FC] text-[22px] font-black uppercase text-[#1E293B] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(12,19,45,0.08)]">
                {(displayName || email || "I").slice(0, 1)}
              </div>
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

            <section className="shape-card mt-8 border border-[#D6D9DE] bg-[#F8FAFC] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
                    Access
                  </p>
                  <h2 className="mt-1 text-[22px] font-bold text-[#111111]">
                    The User Manual
                  </h2>
                  <p className="mt-2 text-[14px] leading-5 text-[#536071]">
                    This is tied to your Yoga With Ethan account, so it follows you across web and future
                    iOS access.
                  </p>
                </div>

                {entitlement ? (
                  <span className="shape-control inline-flex h-10 shrink-0 items-center justify-center bg-[#DCFCE7] px-4 text-[14px] font-black text-[#166534]">
                    Unlocked forever
                  </span>
                ) : (
                  <Link
                    href="/paid?feature=profile"
                    className="shape-control inline-flex h-10 shrink-0 items-center justify-center bg-[#1E68B6] px-4 text-[14px] font-black text-white shadow-[0_10px_24px_rgba(30,104,182,0.22)]"
                  >
                    Unlock for $144
                  </Link>
                )}
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="shape-card bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] ring-1 ring-black/5">
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
                    Status
                  </p>
                  <p className="mt-2 text-[16px] font-bold text-[#111111]">
                    {entitlement ? "Active access" : "No purchase yet"}
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-[#536071]">
                    {entitlement
                      ? `${entitlement.source ?? "Yoga With Ethan"} access since ${formatProfileDate(entitlement.starts_at)}`
                      : "The welcome section stays free. The library unlock is a one-time purchase."}
                  </p>
                </div>

                <div className="shape-card bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] ring-1 ring-black/5">
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
                    Purchases
                  </p>
                  {purchases?.length ? (
                    <ul className="mt-2 space-y-2">
                      {purchases.map((purchase) => (
                        <li
                          key={`${purchase.provider}-${purchase.purchased_at}`}
                          className="text-[13px] leading-5 text-[#536071]"
                        >
                          <span className="font-bold text-[#111111]">
                            {formatPurchaseAmount(purchase.amount_cents, purchase.currency)}
                          </span>{" "}
                          via {purchase.provider ?? "provider"} on{" "}
                          {formatProfileDate(purchase.purchased_at)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-[13px] leading-5 text-[#536071]">
                      Purchase receipts will appear here after checkout.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <div className="mt-8 grid gap-7 md:grid-cols-[1fr_1fr]">
              <form action={updateProfile} className="space-y-4">
                <h2 className="text-[20px] font-bold text-[#111111]">
                  Profile
                </h2>
                <label className="block">
                  <span className="text-[13px] font-bold text-[#334155]">Display name</span>
                  <input
                    name="display_name"
                    type="text"
                    defaultValue={displayName}
                    autoComplete="name"
                    className="shape-control mt-2 h-12 w-full border border-[#D6D9DE] bg-white px-4 text-[16px] text-[#111111] outline-none focus:border-[#1E68B6] focus:ring-4 focus:ring-[#1E68B6]/12"
                  />
                </label>

                <label className="block">
                  <span className="text-[13px] font-bold text-[#334155]">Email</span>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="shape-control mt-2 h-12 w-full border border-[#D6D9DE] bg-[#F8FAFC] px-4 text-[16px] text-[#536071] outline-none"
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

                <button
                  type="submit"
                  className="shape-control h-12 w-full bg-[#1E68B6] px-5 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(30,104,182,0.24)]"
                >
                  Save profile
                </button>
              </form>

              <div className="shape-card space-y-2 bg-[#F5F8FC] px-5 py-5">
                <h2 className="text-[20px] font-bold text-[#111111]">Passwordless security</h2>
                <p className="text-[14px] leading-6 text-[#536071]">
                  Yoga With Ethan emails you a secure, one-time link whenever you log in. There is no password to remember or reset.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </ThemeProvider>
  );
}
