export const WELCOME_COMPLETED_COOKIE = "um_welcome_completed";

export function safeWelcomeNext(value: FormDataEntryValue | string | null | undefined) {
  const next = String(value ?? "/levels/1");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/levels/1";
}

export function welcomeCookieOptions() {
  return {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
