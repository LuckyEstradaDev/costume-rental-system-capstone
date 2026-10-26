const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;

const SIZE_ICON_CLASSES = [
  "size-3",
  "size-3.5",
  "size-4",
  "size-5",
  "size-6",
  "size-7",
  "size-8",
];

export function getSizeRank(size: string) {
  const normalized = normalizeSize(size);
  const index = SIZE_ORDER.findIndex((s) => s.toLowerCase() === normalized);
  return index >= 0 ? index : Math.floor(SIZE_ICON_CLASSES.length / 2);
}

function normalizeSize(size: string) {
  const normalized = (size || "").trim().toUpperCase();
  return normalized === "XXL" ? "2XL" : normalized.toLowerCase();
}

export function formatSizeLabel(size: string) {
  const trimmed = size.trim();
  return trimmed.toUpperCase() === "XXL" ? "2XL" : trimmed;
}

export function compareSizes(a: string, b: string) {
  const normalizedA = normalizeSize(a);
  const normalizedB = normalizeSize(b);
  const rankA = SIZE_ORDER.findIndex((size) => size.toLowerCase() === normalizedA);
  const rankB = SIZE_ORDER.findIndex((size) => size.toLowerCase() === normalizedB);

  if (rankA === -1 || rankB === -1) {
    if (rankA === -1 && rankB === -1) return a.localeCompare(b);
    return rankA === -1 ? 1 : -1;
  }

  return rankA - rankB;
}

export function getSizeIconClass(size: string) {
  const index = Math.min(
    getSizeRank(size),
    SIZE_ICON_CLASSES.length - 1,
  );
  return SIZE_ICON_CLASSES[index];
}