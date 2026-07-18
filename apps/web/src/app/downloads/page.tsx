import Link from "next/link";
import { redirect } from "next/navigation";

import { USER_MANUAL_PRODUCT_SLUG, getUserManualEntitlement } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";
import { ThemeProvider } from "@/themes/ThemeProvider";
import { dseTheme } from "@/themes/dse";

interface DownloadRow {
  description: string | null;
  file_url: string | null;
  id: string;
  sort_order: number;
  storage_bucket: string | null;
  storage_path: string | null;
  title: string;
  tutorial_level_id: string | null;
  updated_at: string | null;
}

function formatUpdated(value: string | null) {
  if (!value) return "Recently added";

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function fileLabel(download: DownloadRow) {
  if (download.storage_path) {
    const extension = download.storage_path.split(".").pop();
    return extension ? extension.toUpperCase() : "Private file";
  }

  if (download.file_url) return "External file";

  return "File pending";
}

export default async function DownloadsPage() {
  const entitlement = await getUserManualEntitlement();

  if (!entitlement.userId) {
    redirect("/login?next=/downloads");
  }

  if (!entitlement.entitled) {
    redirect("/paid?feature=downloads");
  }

  const supabase = await createClient();
  const db = supabase as any;
  const { data: downloads, error } = await db
    .from("product_downloads")
    .select("id,title,description,file_url,storage_bucket,storage_path,sort_order,tutorial_level_id,updated_at")
    .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  return (
    <ThemeProvider theme={dseTheme} className="flex-1">
      <main
        className="min-h-[100dvh] px-5 py-8 md:py-12"
        style={{ background: "var(--theme-color-surface)" }}
      >
        <div className="mx-auto w-full max-w-[760px]">
          <Link
            href="/"
            transitionTypes={["nav-back"]}
            className="shape-control inline-flex h-10 items-center justify-center bg-white px-4 text-[14px] font-bold text-[#1E293B] shadow-[0_8px_20px_rgba(12,19,45,0.10)] ring-1 ring-black/5"
          >
            Back to roadmap
          </Link>

          <header className="mt-8">
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#64748B]">
              Paid companion
            </p>
            <h1
              className="mt-2 text-[42px] font-bold leading-none text-[#111111] md:text-[56px]"
              style={{ fontFamily: "var(--theme-font-heading)" }}
            >
              Downloads
            </h1>
            <p className="mt-4 max-w-[620px] text-[17px] leading-7 text-[#536071]">
              These files are tied to your Yoga With Ethan purchase. Private files open through short-lived
              links, so the same library can be used safely by web, iOS, and Android.
            </p>
          </header>

          {error ? (
            <section className="shape-frame mt-8 bg-white p-6 text-[15px] font-semibold text-[#B42318] shadow-[0_18px_45px_rgba(12,19,45,0.10)] ring-1 ring-black/5">
              Could not load downloads: {error.message}
            </section>
          ) : downloads?.length ? (
            <section className="mt-8 grid gap-4">
              {(downloads as DownloadRow[]).map((download) => (
                <article
                  key={download.id}
                  className="shape-card bg-white p-5 shadow-[0_14px_34px_rgba(12,19,45,0.09)] ring-1 ring-black/5 md:flex md:items-center md:justify-between md:gap-6"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="shape-control bg-[#F5F8FC] px-3 py-1 text-[11px] font-black uppercase tracking-[0.1em] text-[#64748B]">
                        {fileLabel(download)}
                      </span>
                      <span className="text-[12px] font-semibold text-[#94A3B8]">
                        Updated {formatUpdated(download.updated_at)}
                      </span>
                    </div>
                    <h2 className="mt-3 text-[22px] font-black text-[#111111]">
                      {download.title}
                    </h2>
                    {download.description ? (
                      <p className="mt-2 text-[15px] leading-6 text-[#536071]">
                        {download.description}
                      </p>
                    ) : null}
                  </div>
                  <a
                    href={`/api/downloads/${download.id}`}
                    className="shape-control mt-5 inline-flex h-11 shrink-0 items-center justify-center bg-[#1E68B6] px-5 text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(30,104,182,0.24)] md:mt-0"
                  >
                    Download
                  </a>
                </article>
              ))}
            </section>
          ) : (
            <section className="shape-frame mt-8 bg-white p-6 text-[16px] leading-7 text-[#536071] shadow-[0_18px_45px_rgba(12,19,45,0.10)] ring-1 ring-black/5">
              Downloads are unlocked, but no published files have been added yet.
            </section>
          )}
        </div>
      </main>
    </ThemeProvider>
  );
}
