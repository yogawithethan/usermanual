import { createClient } from "@/lib/supabase/server";

export const USER_MANUAL_PRODUCT_SLUG = "the-user-manual";

export async function getUserManualEntitlement() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return { entitled: false, userId: null };
  }

  const { data, error } = await supabase
    .from("product_entitlements")
    .select("id,status,ends_at")
    .eq("user_id", userId)
    .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
    .eq("status", "active");

  if (error) {
    console.warn("[entitlements] lookup failed", error.message);
  }

  const now = Date.now();
  const entitled = Boolean(
    data?.some((entitlement) => {
      if (!entitlement.ends_at) return true;
      const endsAt = new Date(entitlement.ends_at).getTime();
      return Number.isFinite(endsAt) && endsAt > now;
    }),
  );

  return { entitled, userId };
}
