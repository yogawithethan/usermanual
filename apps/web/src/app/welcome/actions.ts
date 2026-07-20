"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  WELCOME_COMPLETED_COOKIE,
  safeWelcomeNext,
  welcomeCookieOptions,
} from "@/lib/welcome";
import { callYweMemberApi, getYweMemberSession } from "@/lib/ywe-member-api";

export async function completeWelcome(formData: FormData) {
  const next = safeWelcomeNext(formData.get("next"));
  const cookieStore = await cookies();
  cookieStore.set(WELCOME_COMPLETED_COOKIE, "1", welcomeCookieOptions());

  const session = await getYweMemberSession();
  if (!session.signedIn) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  const response = await callYweMemberApi("/api/user-manual/welcome", {
    body: JSON.stringify({ completed: true }),
    method: "PATCH",
  });
  if (!response.ok) {
    const result = (await response.json().catch(() => ({}))) as { error?: string };
    redirect(`/welcome?error=${encodeURIComponent(result.error ?? "Could not save welcome progress")}&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}
