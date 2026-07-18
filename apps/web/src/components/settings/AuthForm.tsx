"use client";

import { YwePasswordlessAccess } from "@/components/auth/YwePasswordlessAccess";

type Mode = "sign-in" | "sign-up";

export function AuthForm({
  onSuccess: _onSuccess,
  hideHeader: _hideHeader,
  hideModeToggle: _hideModeToggle,
  mode: controlledMode,
  onModeChange: _onModeChange,
}: {
  onSuccess?: () => void;
  hideHeader?: boolean;
  hideModeToggle?: boolean;
  mode?: Mode;
  onModeChange?: (mode: Mode) => void;
}) {
  return (
    <div className="shape-card mt-2 border border-black/5 bg-white/75 p-[18px]">
      <YwePasswordlessAccess
        initialMode={controlledMode === "sign-up" ? "signup" : "signin"}
        showBrand={false}
      />
    </div>
  );
}
