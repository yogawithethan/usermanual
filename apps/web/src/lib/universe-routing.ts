const WTFU_CONTENT_SLUG = "wake-the-fck-up";
const WTFU_ROUTE_SLUG = "wtfu";
const WTFU_LEGACY_SLUGS = new Set([WTFU_CONTENT_SLUG, "wake-the-fuck-up"]);

export function canonicalUniverseRouteSlug(slug: string) {
  return WTFU_LEGACY_SLUGS.has(slug) ? WTFU_ROUTE_SLUG : slug;
}

export function resolveUniverseContentSlug(slug: string) {
  return slug === WTFU_ROUTE_SLUG || WTFU_LEGACY_SLUGS.has(slug)
    ? WTFU_CONTENT_SLUG
    : slug;
}

export function universeHref(slug: string, suffix = "") {
  return `/universes/${canonicalUniverseRouteSlug(slug)}${suffix}`;
}
