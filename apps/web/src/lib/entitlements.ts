import { getYweMemberSession } from "@/lib/ywe-member-api";
import { getDevAccessPreview } from "@/lib/dev-access-preview";

export const USER_MANUAL_PRODUCT_SLUG = "the-user-manual";

export async function getUserManualEntitlement() {
  const [memberSession, preview] = await Promise.all([
    getYweMemberSession(),
    getDevAccessPreview(),
  ]);
  const realSignedIn = memberSession.signedIn;
  const previewSignedIn = preview.enabled && preview.signedIn;
  const previewEntitled = preview.enabled && preview.fullAccess;

  return {
    email: realSignedIn ? memberSession.member?.email ?? null : null,
    entitled: Boolean(
      (realSignedIn && memberSession.access?.entitled) || previewEntitled,
    ),
    isPreview: previewSignedIn && !realSignedIn,
    purchaseEnabled: Boolean(
      (realSignedIn && memberSession.capabilities?.purchaseEnabled) || previewSignedIn,
    ),
    realSignedIn,
    signedIn: realSignedIn || previewSignedIn,
    userId: realSignedIn ? "shared-ywe-member" : previewSignedIn ? "dev-preview" : null,
  };
}
