"use client";

import { usePathname } from "next/navigation";

import { useAuth } from "@/lib/settings/AuthContext";
import { useSettings } from "@/lib/settings/SettingsContext";
import { userManualComingSoon } from "@/lib/launch";
import { PurchaseDisclosure } from "@/components/purchase/PurchaseDisclosure";

export function PurchaseUnlockCard() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { devSimulateSignedIn, purchased } = useSettings();
  const signedIn = Boolean(user || devSimulateSignedIn);
  const primaryHref = "/paid?feature=full-tutorial";
  const excluded = ["/login", "/paid", "/ui-lab", "/welcome", "/onboarding"]
    .some((route) => pathname?.startsWith(route));

  // Pre-launch, the Coming Soon gate carries the (preorder) sell — a $144
  // unlock bar under a $90 dialog would contradict it.
  if (purchased || excluded || userManualComingSoon()) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[20005] flex justify-center px-4 sm:bottom-5">
      <div className="pointer-events-auto w-full max-w-[460px]">
        <PurchaseDisclosure
          compact
          primaryHref={signedIn ? primaryHref : undefined}
          onPrimaryAction={signedIn
            ? undefined
            : () => window.dispatchEvent(new CustomEvent("yweOpenAuth", { detail: { mode: "signin" } }))}
          primaryLabel={signedIn ? "Unlock full access" : "Log in or sign up"}
        />
      </div>
    </div>
  );
}
