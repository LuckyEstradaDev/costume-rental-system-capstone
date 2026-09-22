/**
 * Shared slug helpers.
 *
 * Outfit and package detail links all follow one convention:
 * `<normalized-name>-<id>`. The detail pages recover the id from the LAST
 * dash-separated segment (see `getIdFromSlug`), so these three helpers must
 * always agree.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildOutfitSlug(name: string, outfitId?: string): string {
  if (!outfitId) return "";
  return `${slugify(name)}-${outfitId}`;
}

export function buildPackageSlug(name: string, packageId?: string): string {
  if (!packageId) return "";
  return `${slugify(name)}-${packageId}`;
}

export function buildOrderSlug(name: string, orderId?: string): string {
  if (!orderId) return "";
  return `${slugify(name)}-${orderId}`;
}

export function getIdFromSlug(slug: string): string {
  const parts = slug.split("-");
  return parts[parts.length - 1] ?? "";
}