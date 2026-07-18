"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getPracticeUniverse } from "@islands/content";
import { getUserManualEntitlement } from "@/lib/entitlements";
import { contiguousCompletedLevelCount } from "@/lib/practice-access";
import { createClient } from "@/lib/supabase/server";

export async function registerReleaseInterest(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const universe = getPracticeUniverse(slug);

  if (!universe) {
    redirect("/");
  }

  const entitlement = await getUserManualEntitlement();
  if (!entitlement.userId) {
    redirect(`/login?next=${encodeURIComponent(`/universes/${slug}`)}`);
  }
  if (!entitlement.entitled) {
    redirect(`/paid?feature=${encodeURIComponent(slug)}`);
  }

  const supabase = await createClient();
  const [{ data: release }, { data: profile }] = await Promise.all([
    supabase
      .from("practice_universes")
      .select("release_status")
      .eq("slug", slug)
      .eq("product_slug", "the-user-manual")
      .single(),
    supabase
      .from("profiles")
      .select("email")
      .eq("id", entitlement.userId)
      .single(),
  ]);

  if (release?.release_status !== "coming_soon") {
    redirect(`/universes/${slug}`);
  }

  const email = profile?.email?.trim();
  if (!email) {
    redirect(`/universes/${slug}?error=${encodeURIComponent("Add an email to your account before requesting a release notification.")}`);
  }

  const { error } = await supabase.from("content_release_interests").upsert(
    {
      email,
      notify_email: true,
      universe_slug: slug,
      user_id: entitlement.userId,
    },
    { onConflict: "user_id,universe_slug" },
  );

  if (error) {
    redirect(`/universes/${slug}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/universes/${slug}?notification=registered`);
}

export async function completeUniverse(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const becomingComplete = String(formData.get("complete") ?? "1") !== "0";
  const universe = getPracticeUniverse(slug);
  if (!universe) redirect("/");

  const entitlement = await getUserManualEntitlement();
  if (!entitlement.userId) redirect(`/login?next=${encodeURIComponent(`/universes/${slug}`)}`);
  if (!entitlement.entitled) redirect(`/paid?feature=${encodeURIComponent(slug)}`);

  const supabase = await createClient();
  const { data: completedLevels } = await supabase
    .from("tutorial_progress")
    .select("level_number,status")
    .eq("user_id", entitlement.userId)
    .eq("product_slug", "the-user-manual")
    .eq("status", "completed");
  if (
    contiguousCompletedLevelCount(completedLevels ?? []) <
    universe.unlockAfterLevel
  ) {
    redirect(`/locked?type=universe&required=${universe.unlockAfterLevel}&target=${universe.slug}`);
  }

  const now = new Date().toISOString();
  const db = supabase as any;
  const { error } = await db.from("practice_universe_progress").upsert(
    {
      user_id: entitlement.userId,
      product_slug: "the-user-manual",
      universe_slug: slug,
      status: becomingComplete ? "completed" : "in_progress",
      started_at: now,
      completed_at: becomingComplete ? now : null,
    },
    { onConflict: "user_id,product_slug,universe_slug" },
  );
  if (error) redirect(`/universes/${slug}?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath(`/universes/${slug}`);
  redirect(`/universes/${slug}`);
}
