"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getPracticeUniverse } from "@islands/content";
import { getUserManualEntitlement } from "@/lib/entitlements";
import { callYweMemberApi } from "@/lib/ywe-member-api";
import { universeHref } from "@/lib/universe-routing";

export async function registerReleaseInterest(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const universe = getPracticeUniverse(slug);

  if (!universe) {
    redirect("/");
  }

  const entitlement = await getUserManualEntitlement();
  if (!entitlement.userId) {
    redirect(`/login?next=${encodeURIComponent(universeHref(slug))}`);
  }
  if (!entitlement.entitled) {
    redirect(`/paid?feature=${encodeURIComponent(slug)}`);
  }

  const response = await callYweMemberApi("/api/release-interest/user-manual", {
    body: JSON.stringify({ tutorialSlug: slug, emailEnabled: true, telegramEnabled: false }),
    method: "PATCH",
  });
  if (!response.ok) {
    const result = (await response.json().catch(() => ({}))) as { error?: string };
    redirect(`${universeHref(slug)}?error=${encodeURIComponent(result.error ?? "Could not save notification preference")}`);
  }

  redirect(`${universeHref(slug)}?notification=registered`);
}

export async function completeUniverse(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const status = String(formData.get("complete") ?? "1") === "0"
    ? "in_progress"
    : "completed";
  const universe = getPracticeUniverse(slug);

  if (!universe) redirect("/");

  const entitlement = await getUserManualEntitlement();
  if (!entitlement.userId) {
    redirect(`/login?next=${encodeURIComponent(universeHref(slug))}`);
  }
  if (!entitlement.entitled) {
    redirect(`/paid?feature=${encodeURIComponent(slug)}`);
  }

  const response = await callYweMemberApi("/api/progress/practices", {
    body: JSON.stringify({ practiceId: slug, status }),
    method: "PATCH",
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({})) as { error?: string };
    redirect(`${universeHref(slug)}?error=${encodeURIComponent(result.error ?? "Could not update tutorial progress")}`);
  }

  revalidatePath("/");
  revalidatePath(universeHref(slug));
  redirect(universeHref(slug));
}
