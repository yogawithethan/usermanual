import { useEffect } from "react";
import { AppState } from "react-native";

import { getValidIslandsSession } from "@/auth/islands";
import { readPendingCheckout } from "@/payments/checkout";
import { refreshUserManualSync } from "@/state/entitlement";

async function runForegroundMaintenance() {
  const session = await getValidIslandsSession();
  if (!session?.accessToken) return;

  const pendingCheckout = await readPendingCheckout();
  if (pendingCheckout) {
    await refreshUserManualSync(session.accessToken);
  }
}

export function AppLifecycle() {
  useEffect(() => {
    runForegroundMaintenance().catch(() => {
      // Foreground maintenance must never block app launch.
    });

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        runForegroundMaintenance().catch(() => {
          // The visible screens already surface actionable sync errors.
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return null;
}
