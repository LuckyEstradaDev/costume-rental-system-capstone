function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isBinary(value: unknown): value is Blob {
  return typeof Blob !== "undefined" && value instanceof Blob;
}

function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

/**
 * Compares a draft against the values it was seeded with.
 *
 * Files are compared by reference: the form swaps the stored url for the file
 * that was picked, so a different file always counts as a change - even when
 * both files would serialise to the same thing.
 */
export function isFormDirty(current: unknown, baseline: unknown): boolean {
  if (Object.is(current, baseline)) return false;

  if (isDate(current) || isDate(baseline)) {
    if (!isDate(current) || !isDate(baseline)) return true;
    return current.getTime() !== baseline.getTime();
  }

  if (isBinary(current) || isBinary(baseline)) {
    if (!isBinary(current) || !isBinary(baseline)) return true;
    return current !== baseline;
  }

  if (Array.isArray(current) || Array.isArray(baseline)) {
    if (!Array.isArray(current) || !Array.isArray(baseline)) return true;
    if (current.length !== baseline.length) return true;
    return current.some((item, index) => isFormDirty(item, baseline[index]));
  }

  if (isPlainObject(current) && isPlainObject(baseline)) {
    const keys = Object.keys(current);
    if (keys.length !== Object.keys(baseline).length) return true;
    return keys.some((key) => isFormDirty(current[key], baseline[key]));
  }

  return true;
}
