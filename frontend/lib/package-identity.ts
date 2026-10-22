/**
 * Package orders only store the costumes they contain, so the package name and
 * picture are resolved in the browser by matching the ordered costumes against
 * the package list.
 */
export type PackageSource = {
  _id?: string;
  name: string;
  imageURL?: string[];
  items?: {_id: string}[];
  createdAt?: Date | string;
};

export type PackageIdentity = {
  packageId: string;
  name: string;
  imageURL: string[];
  itemCount: number;
};

export type OrderDisplayIdentity = {
  name: string;
  imageURL?: string;
  isPackage: boolean;
  packageCount: number;
};

export type PackageItemGroup<T> = {
  identity: PackageIdentity;
  items: T[];
};

export const PACKAGE_FALLBACK_IMAGE = "/assets/images/landing-page/suit.jpg";

export const getPackageImageSrc = (imageURL?: string[]) => {
  const src = imageURL?.[0];

  if (!src) {
    return PACKAGE_FALLBACK_IMAGE;
  }

  if (src.startsWith("/")) {
    return src;
  }

  try {
    const url = new URL(src);
    return url.hostname === "res.cloudinary.com" ? src : PACKAGE_FALLBACK_IMAGE;
  } catch {
    return PACKAGE_FALLBACK_IMAGE;
  }
};

const outfitIdsOf = (pkg: PackageSource) =>
  new Set((pkg.items ?? []).map((item) => String(item._id)));

const createdAtOf = (pkg: PackageSource) => {
  if (!pkg.createdAt) return 0;
  const value = new Date(pkg.createdAt).getTime();
  return Number.isNaN(value) ? 0 : value;
};

/**
 * Finds the package an order was placed for by matching the costumes it
 * contains against the package list. The package that covers the most ordered
 * costumes wins, so duplicated packages resolve to the newest one.
 */
export const resolveOrderPackages = (
  order: {isPackage?: boolean; items: {outfitId?: string}[]},
  packages: PackageSource[],
): PackageIdentity[] => {
  if (!order.isPackage || packages.length === 0) {
    return [];
  }

  const rows = order.items ?? [];

  // Rank the packages by how much of the order they explain: the package that
  // covers the most ordered costumes wins, a package whose outfits are all in
  // the order beats one that is only partly in it, and identical packages are
  // broken by age.
  const scored = packages.map((pkg) => {
    const ids = outfitIdsOf(pkg);
    const matched = rows.filter((row) => ids.has(String(row.outfitId))).length;
    const total = (pkg.items ?? []).length;

    return {
      pkg,
      matched,
      coverage: total > 0 ? matched / total : 0,
    };
  });

  scored.sort((a, b) => {
    if (b.matched !== a.matched) {
      return b.matched - a.matched;
    }

    if (b.coverage !== a.coverage) {
      return b.coverage - a.coverage;
    }

    return createdAtOf(b.pkg) - createdAtOf(a.pkg);
  });

  const used = new Array(rows.length).fill(false);
  const resolved: (PackageIdentity & {firstIndex: number})[] = [];

  for (const {pkg} of scored) {
    const ids = outfitIdsOf(pkg);

    const indexes = rows
      .map((row, index) => ({row, index}))
      .filter(
        ({row, index}) =>
          !used[index] && ids.has(String(row.outfitId)),
      )
      .map(({index}) => index);

    const firstIndex = indexes[0];

    if (firstIndex === undefined) {
      continue;
    }

    indexes.forEach((index) => {
      used[index] = true;
    });

    resolved.push({
      packageId: String(pkg._id ?? ""),
      name: pkg.name,
      imageURL: pkg.imageURL ?? [],
      itemCount: indexes.length,
      firstIndex,
    });
  }

  // keep the packages aligned with the flattened order items
  resolved.sort((a, b) => a.firstIndex - b.firstIndex);

  return resolved.map((entry) => ({
    packageId: entry.packageId,
    name: entry.name,
    imageURL: entry.imageURL,
    itemCount: entry.itemCount,
  }));
};

/**
 * The package an order was placed for shows its own name and picture. Orders
 * without a matching package (plain orders, or packages that were deleted)
 * fall back to the first ordered costume.
 */
export const getOrderDisplayIdentity = (
  order: {isPackage?: boolean; items: {name?: string; imageURL?: string}[]},
  resolved: PackageIdentity[],
): OrderDisplayIdentity => {
  const firstPackage = resolved[0];

  if (firstPackage) {
    return {
      name: firstPackage.name,
      imageURL: firstPackage.imageURL?.[0],
      isPackage: true,
      packageCount: resolved.length,
    };
  }

  const firstItem = order.items?.[0];

  return {
    name: firstItem?.name ?? "Order",
    imageURL: firstItem?.imageURL,
    isPackage: Boolean(order.isPackage),
    packageCount: 0,
  };
};

/**
 * Groups the flattened order items back under the package they came from.
 * Returns null when the order cannot be matched to a package.
 */
export const groupItemsByPackage = <T>(
  items: T[],
  resolved: PackageIdentity[],
): PackageItemGroup<T>[] | null => {
  if (resolved.length === 0) {
    return null;
  }

  let cursor = 0;

  const groups = resolved.map((identity) => {
    const count = Math.max(identity.itemCount, 0);
    const groupItems = items.slice(cursor, cursor + count);
    cursor += count;

    return {identity, items: groupItems};
  });

  const lastGroup = groups[groups.length - 1];

  if (lastGroup && cursor < items.length) {
    // keep any leftover rows (costumes no package contains)
    lastGroup.items.push(...items.slice(cursor));
  }

  return groups;
};

export const countItems = (items: {quantity?: number}[]) =>
  items.reduce((total, item) => total + (item.quantity ?? 0), 0);
