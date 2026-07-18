"use client";

import type { ReactNode } from "react";

import { AuthProvider } from "@/lib/settings/AuthContext";
import { SettingsProvider } from "@/lib/settings/SettingsContext";
import { AmbientMotionController } from "@/components/motion/AmbientMotionController";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AmbientMotionController />
        {children}
      </SettingsProvider>
    </AuthProvider>
  );
}
