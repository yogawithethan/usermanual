import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { startMobileCheckout } from "@/api/userManual";

const checkoutSuccessReturnTo = "usermanual://checkout/success";
const checkoutCancelReturnTo = "usermanual://checkout/cancel";
const pendingCheckoutKey = "um.checkout.pending";

export type MobileCheckoutStatus = "already-entitled" | "cancel" | "dismiss" | "success";

export interface PendingCheckout {
  feature: string;
  returnedAt: string;
  sessionId: string | null;
  status: Exclude<MobileCheckoutStatus, "already-entitled" | "dismiss">;
}

export interface MobileCheckoutResult {
  sessionId: string | null;
  status: MobileCheckoutStatus;
}

export async function readPendingCheckout() {
  const raw = await AsyncStorage.getItem(pendingCheckoutKey);
  if (!raw) return null;

  return JSON.parse(raw) as PendingCheckout;
}

export async function clearPendingCheckout() {
  await AsyncStorage.removeItem(pendingCheckoutKey);
}

async function writePendingCheckout(checkout: PendingCheckout) {
  await AsyncStorage.setItem(pendingCheckoutKey, JSON.stringify(checkout));
}

export async function openUserManualCheckout(accessToken: string, feature: string): Promise<MobileCheckoutResult> {
  const checkout = await startMobileCheckout(accessToken, {
    cancelReturnTo: checkoutCancelReturnTo,
    feature,
    successReturnTo: checkoutSuccessReturnTo,
  });

  if (checkout.alreadyEntitled || !checkout.url) {
    await clearPendingCheckout();
    return { sessionId: null, status: "already-entitled" };
  }

  const result = await WebBrowser.openAuthSessionAsync(checkout.url, "usermanual://checkout");

  if (result.type !== "success") {
    return { sessionId: null, status: result.type === "cancel" ? "cancel" : "dismiss" };
  }

  const callbackUrl = new URL(result.url);
  const status = callbackUrl.searchParams.get("status") === "cancel" ? "cancel" : "success";
  const sessionId = callbackUrl.searchParams.get("session_id");

  if (status === "success") {
    await writePendingCheckout({
      feature,
      returnedAt: new Date().toISOString(),
      sessionId,
      status,
    });
  } else {
    await clearPendingCheckout();
  }

  return { sessionId, status };
}
