const ORDER_REFERENCE_PATTERN = /^(?:ORD|REN)-\d{4}-[A-Z0-9_-]+$/;
const OUTFIT_REFERENCE_PATTERN = /^OUT-\d{4}-[A-Z0-9_-]+$/;
const PACKAGE_REFERENCE_PATTERN = /^PKG-\d{4}-[A-Z0-9_-]+$/;
const OBJECT_ID_PATTERN = /^[A-F0-9]{24}$/;

export const normalizeReference = (
  value?: string | string[] | null,
): string => {
  const reference = Array.isArray(value) ? value[0] : value;
  return reference?.trim().toUpperCase() ?? "";
};

export const isOrderReference = (value?: string | string[] | null) =>
  ORDER_REFERENCE_PATTERN.test(normalizeReference(value));

export const isOutfitReference = (value?: string | string[] | null) =>
  OUTFIT_REFERENCE_PATTERN.test(normalizeReference(value));

export const isPackageReference = (value?: string | string[] | null) =>
  PACKAGE_REFERENCE_PATTERN.test(normalizeReference(value));

export const isObjectId = (value?: string | string[] | null) =>
  OBJECT_ID_PATTERN.test(normalizeReference(value));

export const buildOrderPath = (referenceID?: string | null) => {
  const reference = normalizeReference(referenceID);
  return isOrderReference(reference)
    ? `/dashboard/orders/${encodeURIComponent(reference)}`
    : "";
};

export const buildAdminOrderPath = (referenceID?: string | null) => {
  const reference = normalizeReference(referenceID);
  return isOrderReference(reference)
    ? `/admin/orders/${encodeURIComponent(reference)}`
    : "";
};

export const buildOutfitPath = (referenceID?: string | null) => {
  const reference = normalizeReference(referenceID);
  return isOutfitReference(reference) || isObjectId(reference)
    ? `/dashboard/browse/${encodeURIComponent(reference)}`
    : "";
};

export const buildPackagePath = (referenceID?: string | null) => {
  const reference = normalizeReference(referenceID);
  return isPackageReference(reference)
    ? `/dashboard/browse/package/${encodeURIComponent(reference)}`
    : "";
};
