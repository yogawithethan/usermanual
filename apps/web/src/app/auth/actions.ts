"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getIslandsAuthOrigin } from "@/lib/islands-sso";
import { WELCOME_COMPLETED_COOKIE } from "@/lib/welcome";
import { cookies } from "next/headers";

function redirectPath(formData: FormData) {
  const next = String(formData.get("next") ?? "/");
  return next.startsWith("/") ? next : "/";
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(redirectPath(formData))}`);
  }

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (userId && (await cookies()).get(WELCOME_COMPLETED_COOKIE)?.value === "1") {
    await supabase
      .from("profiles")
      .update({ welcome_completed_at: new Date().toISOString() })
      .eq("id", userId);
  }

  redirect(redirectPath(formData));
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = redirectPath(formData);

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002"}${next}`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }

  redirect(`/login?message=${encodeURIComponent("Check your email to finish creating your Islands account.")}&next=${encodeURIComponent(next)}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002";
  const logoutUrl = new URL("/auth/logout", getIslandsAuthOrigin());
  logoutUrl.searchParams.set("return_to", siteUrl);
  redirect(logoutUrl.toString());
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login?next=/profile");
  }

  const displayName = String(formData.get("display_name") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName || null,
      timezone: timezone || null,
    })
    .eq("id", userId);

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/profile");
  redirect("/profile?message=Profile updated");
}

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login?next=/onboarding");
  }

  const displayName = String(formData.get("display_name") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();
  const primaryGoal = String(formData.get("primary_goal") ?? "").trim();
  const onboardingNote = String(formData.get("onboarding_note") ?? "").trim();
  const next = redirectPath(formData);
  const welcomeCompleted =
    (await cookies()).get(WELCOME_COMPLETED_COOKIE)?.value === "1";

  if (!displayName) {
    redirect("/onboarding?error=Please add your name");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      timezone: timezone || null,
      primary_goal: primaryGoal || null,
      onboarding_note: onboardingNote || null,
      onboarding_completed_at: new Date().toISOString(),
      ...(welcomeCompleted
        ? { welcome_completed_at: new Date().toISOString() }
        : {}),
    })
    .eq("id", userId);

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/profile");
  redirect(next);
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    redirect("/login?next=/profile");
  }

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (password.length < 8) {
    redirect("/profile?error=Password must be at least 8 characters");
  }

  if (password !== confirmPassword) {
    redirect("/profile?error=Passwords do not match");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/profile?message=Password updated across your Islands account");
}

export async function sendPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect("/reset-password?error=Please enter your email address");
  }

  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002"}/profile`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    "/reset-password?message=If that email has an Islands account, a reset link has been sent.",
  );
}
