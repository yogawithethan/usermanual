"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { YwePasswordlessAccess } from "@/components/auth/YwePasswordlessAccess";

interface AuthMenuProps {
  email?: string;
  displayName?: string;
  completedLevelCount?: number;
  next?: string;
}

export function AuthMenu({
  completedLevelCount = 0,
  displayName,
  email,
  next = "/levels/1",
}: AuthMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonId = useId();
  const headingId = useId();
  const isSignedIn = Boolean(email);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("keydown", onKeyDown);
    }

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={panelRef} className="absolute right-0 top-4 z-30">
      <button
        id={buttonId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={isSignedIn ? "Open account menu" : "Open sign in"}
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#1E293B] shadow-[0_8px_20px_rgba(12,19,45,0.14)] ring-1 ring-black/5 backdrop-blur-md transition-transform active:scale-[0.97]"
      >
        {isSignedIn ? (
            <span className="text-[15px] font-black uppercase">
              {(displayName || email)?.slice(0, 1)}
          </span>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )}
      </button>

      {isOpen && (
        isSignedIn ? (
          <section
            role="dialog"
            aria-labelledby={buttonId}
            className="shape-card absolute right-0 mt-3 w-[min(340px,calc(100vw-40px))] bg-white px-5 py-5 text-left shadow-[0_22px_55px_rgba(12,19,45,0.18)] ring-1 ring-black/5"
          >
            <SignedInPanel
              completedLevelCount={completedLevelCount}
              displayName={displayName}
              email={email!}
            />
          </section>
        ) : (
          <SignedOutPanel
            headingId={headingId}
            next={next}
            onClose={() => setIsOpen(false)}
          />
        )
      )}
    </div>
  );
}

function SignedOutPanel({
  headingId,
  next,
  onClose,
}: {
  headingId: string;
  next: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8">
      <button
        type="button"
        aria-label="Close sign in"
        onClick={onClose}
        className="absolute inset-0 bg-[#05070B]/72 backdrop-blur-md"
      />
      <section
        role="dialog"
        aria-labelledby={headingId}
        className="shape-frame relative w-full max-w-[440px] bg-white/96 px-6 py-7 text-left shadow-[0_34px_90px_rgba(0,0,0,0.34)] ring-1 ring-white/40"
      >
        <button
          type="button"
          aria-label="Close sign in"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F5F9] text-[#334155] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
        >
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="flex flex-col items-center pt-7 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#D7DCE3] bg-white text-[#1E293B] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 21a8 8 0 0 0-16 0" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2
            id={headingId}
            className="mt-4 text-[28px] font-bold leading-none text-[#111111]"
          >
            Your account
          </h2>
        </div>

        <div className="mt-5">
          <YwePasswordlessAccess next={next} showBrand={false} />
        </div>
      </section>
    </div>
  );
}

function SignedInPanel({
  completedLevelCount,
  displayName,
  email,
}: {
  completedLevelCount: number;
  displayName?: string;
  email: string;
}) {
  return (
    <>
      <h2 className="text-[24px] font-bold leading-none text-[#111111]">
        {displayName || "Account"}
      </h2>
      <p className="mt-2 break-all text-[14px] font-semibold leading-5 text-[#536071]">
        {email}
      </p>
      <div className="shape-card mt-4 bg-[#F8FAFC] px-4 py-3">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
          Progress
        </p>
        <p className="mt-1 text-[15px] font-bold text-[#1E293B]">
          {completedLevelCount} of 6 levels complete
        </p>
      </div>
      <Link
        href="/profile"
        className="shape-control mt-5 flex h-11 w-full items-center justify-center bg-[#1E68B6] px-5 text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(30,104,182,0.24)]"
      >
        Profile settings
      </Link>
      <form action={signOut} className="mt-5">
        <button
          type="submit"
          className="shape-control h-11 w-full bg-[#F5F8FC] px-5 text-[15px] font-bold text-[#1E293B] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(12,19,45,0.08)]"
        >
          Sign out
        </button>
      </form>
      <p className="mt-5 text-center text-[12px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
        Yoga With Ethan account
      </p>
    </>
  );
}
