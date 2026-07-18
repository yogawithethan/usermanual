import Image from "next/image";
import Link from "next/link";

import type { IslandsAuthMode } from "@/lib/islands-sso";

interface IslandsSsoButtonProps {
  mode?: IslandsAuthMode;
  next: string;
  className?: string;
}

export function IslandsSsoButton({
  className = "",
  mode = "signin",
  next,
}: IslandsSsoButtonProps) {
  const href = `/auth/islands?next=${encodeURIComponent(next)}&mode=${mode}`;

  return (
    <Link
      href={href}
      className={`shape-control group inline-flex h-[52px] w-full items-center justify-center border border-[#D7DCE3] bg-white px-5 text-[15px] font-bold leading-none text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] transition-colors hover:border-[#C7CED8] active:scale-[0.985] ${className}`}
    >
      <span className="flex h-full items-center justify-center gap-2.5">
        <span className="leading-none">{mode === "signup" ? "Sign up with" : "Sign in with"}</span>
        <Image
          src="/islands-wordmark-dark.png"
          alt="Islands"
          width={1366}
          height={386}
          className="block h-auto w-[92px] translate-y-[1px]"
          priority={mode === "signin"}
        />
      </span>
    </Link>
  );
}
