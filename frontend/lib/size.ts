const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL"] as const;

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
  const normalized = (size || "").trim().toLowerCase();
  const index = SIZE_ORDER.findIndex((s) => s.toLowerCase() === normalized);
  return index >= 0 ? index : Math.floor(SIZE_ICON_CLASSES.length / 2);
}

export function getSizeIconClass(size: string) {
  const index = Math.min(
    getSizeRank(size),
    SIZE_ICON_CLASSES.length - 1,
  );
  return SIZE_ICON_CLASSES[index];
}