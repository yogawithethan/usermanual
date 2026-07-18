"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  WELCOME_COMPLETED_COOKIE,
  safeWelcomeNext,
  welcomeCookieOptions,
} from "@/lib/welcome";

export async function completeWelcome(formData: FormData) {
  const next = safeWelcomeNext(formData.get("next"));
  const cookieStore = await cookies();
  cookieStore.set(WELCOME_COMPLETED_COOKIE, "1", welcomeCookieOptions());

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const { error } = await supabase
    .from("profiles")
    .update({ welcome_completed_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    redirect(`/welcome?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}
