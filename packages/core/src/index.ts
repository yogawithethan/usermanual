export type ProductSlug =
  | "the-user-manual"
  | "yoga-with-ethan"
  | "yoga-immersion"
  | "ignorance-is-not-bliss"
  | "one-with-the-sun";

export type EntitlementStatus = "active" | "expired" | "revoked";

export interface ProductEntitlement {
  product: ProductSlug;
  status: EntitlementStatus;
}

export function hasActiveEntitlement(
  entitlements: ProductEntitlement[],
  product: ProductSlug,
): boolean {
  return entitlements.some(
    (entitlement) =>
      entitlement.product === product && entitlement.status === "active",
  );
}
