"use client";

import { useState, type FormEvent } from "react";

const AUTH_ORIGIN = "https://auth.yogawithethan.com";
const YWE_ICON = "https://pub-3b18e580131f44348bc92d16ea67e216.r2.dev/assets/ywe-icon.svg";

export type YweAccessMode = "signin" | "signup";

export function YwePasswordlessAccess({
  initialMode = "signin",
  next = "/",
  showBrand = true,
}: {
  initialMode?: YweAccessMode;
  next?: string;
  showBrand?: boolean;
}) {
  const [mode, setMode] = useState<YweAccessMode>(initialMode);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    { kind: "idle" | "busy" | "success" | "error"; message: string }
  >({ kind: "idle", message: "" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return;

    setStatus({ kind: "busy", message: "Sending your secure link…" });
    try {
      const returnUrl = new URL(
        next.startsWith("/") ? next : "/",
        window.location.origin,
      ).toString();
      const response = await fetch(`${AUTH_ORIGIN}/auth/member/request-link`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, return: returnUrl }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        ok?: boolean;
      };
      if (!response.ok || data.ok === false) {
        throw new Error(data.error || "Could not send the link.");
      }
      setStatus({
        kind: "success",
        message: "Check your email. Your link will bring you back to this page.",
      });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not send the link. Please try again.",
      });
    }
  }

  return (
    <div className="w-full">
      {showBrand ? (
        <img
          src={YWE_ICON}
          alt="Yoga with Ethan"
          width={40}
          height={40}
          className="mx-auto mb-4 h-10 w-10"
        />
      ) : null}

      <div
        className="shape-control relative grid grid-cols-2 bg-[#F3F0EA] p-1"
        role="tablist"
        aria-label="Log in or sign up"
      >
        <span
          aria-hidden="true"
          className="shape-control absolute inset-y-1 w-[calc(50%-4px)] bg-white shadow-[0_4px_14px_rgba(30,25,18,0.1)] transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]"
          style={{ transform: mode === "signup" ? "translateX(100%)" : "translateX(0)" }}
        />
        {(["signin", "signup"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => setMode(value)}
            className="relative z-10 min-h-10 px-4 text-[13px] font-semibold text-[#24201B]"
          >
            {value === "signin" ? "Log in" : "Sign up"}
          </button>
        ))}
      </div>

      <div className="mt-5 text-center">
        <h2 className="text-[25px] font-semibold leading-tight text-[#171411]">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="mt-2 text-[14px] leading-6 text-[#6B655E]">
          {mode === "signin"
            ? "Enter the email connected to your account."
            : "Enter your email to begin."}{" "}
          No password needed.
        </p>
      </div>

      <form onSubmit={submit} className="mt-5 grid gap-3 text-left">
        <label className="grid gap-2 text-[12px] font-semibold text-[#514B45]">
          <span>Email address</span>
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            className="shape-control h-[54px] border border-[#D9D4CC] bg-white px-5 text-[16px] font-medium text-[#171411] outline-none transition-shadow placeholder:text-[#A39C93] focus:shadow-[0_0_0_3px_rgba(20,17,13,0.1)]"
          />
        </label>
        <button
          type="submit"
          disabled={status.kind === "busy"}
          className="shape-control group flex h-[54px] items-center justify-center gap-2 bg-[#14110D] px-5 text-[15px] font-semibold text-white shadow-[0_8px_22px_rgba(12,13,17,0.18)] transition-[box-shadow,opacity] hover:shadow-[0_9px_23px_rgba(12,13,17,0.21)] disabled:opacity-60"
        >
          <span>{status.kind === "busy" ? "Sending…" : "Continue with email"}</span>
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] transition-transform duration-200 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-[3px]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
        <p className="mx-auto max-w-[310px] text-balance text-center text-[12px] leading-5 text-[#7A736B]">
          We’ll email you a secure sign-in link. It will return you to this exact page.
        </p>
        {status.message ? (
          <p
            aria-live="polite"
            className={`shape-card px-4 py-3 text-center text-[13px] font-medium ${
              status.kind === "success"
                ? "bg-[#EEF8F0] text-[#25653A]"
                : status.kind === "error"
                  ? "bg-[#FFF0F0] text-[#A32F2F]"
                  : "bg-[#F5F2ED] text-[#6B655E]"
            }`}
          >
            {status.message}
          </p>
        ) : null}
      </form>
    </div>
  );
}
