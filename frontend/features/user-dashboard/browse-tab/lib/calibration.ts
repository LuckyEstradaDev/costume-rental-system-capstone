/**
 * Reference-object calibration (A4 sheet).
 *
 * MediaPipe estimates metric body size from a single camera using an assumed
 * field of view and an average-human prior, so its absolute scale drifts a few
 * inches against a tape measure. Fixing that needs one known length in the
 * frame: the user holds an A4 sheet flat against the chest, and the ratio of
 * the sheet's on-screen span to the shoulders' on-screen span gives the true
 * shoulder width. No camera intrinsics, no depth sensor — valid because both
 * sit in the same image at roughly the same depth.
 */

/** A4 long edge in metres (297 mm), the reference span we ask the user to show. */
export const A4_LONG_EDGE_M = 0.297;

/** Corrections outside this band are treated as bad input, not real scale. */
const MIN_FACTOR = 0.7;
const MAX_FACTOR = 1.4;

const STORAGE_KEY = "ar:calibration:v1";

export type StoredCalibration = {
  factor: number;
  reference: "a4";
  savedAt: number;
};

/** Returns the factor when it is sane, otherwise null (reject bad input). */
export function clampCorrectionFactor(factor: number): number | null {
  if (!Number.isFinite(factor) || factor < MIN_FACTOR || factor > MAX_FACTOR) {
    return null;
  }
  return factor;
}

/** Median of a numeric sample; ignores non-finite entries. */
export function median(values: number[]): number | null {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) return null;
  const sorted = [...clean].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Correction `k` to multiply MediaPipe's metric measurements by.
 *
 * `refFrac` and `shoulderFrac` are horizontal spans as fractions of the video
 * frame (same units, same image). `mediapipeShoulderM` is the tracker's own
 * shoulder estimate in metres. Returns null when the ratio is degenerate or
 * the result falls outside the sane band.
 */
export function computeCorrectionFactor({
  referenceM = A4_LONG_EDGE_M,
  refFrac,
  shoulderFrac,
  mediapipeShoulderM,
}: {
  referenceM?: number;
  refFrac: number;
  shoulderFrac: number;
  mediapipeShoulderM: number;
}): number | null {
  if (
    !Number.isFinite(referenceM) ||
    !Number.isFinite(refFrac) ||
    !Number.isFinite(shoulderFrac) ||
    !Number.isFinite(mediapipeShoulderM) ||
    referenceM <= 0 ||
    refFrac <= 0 ||
    shoulderFrac <= 0 ||
    mediapipeShoulderM <= 0
  ) {
    return null;
  }

  const trueShoulderM = referenceM * (shoulderFrac / refFrac);
  return clampCorrectionFactor(trueShoulderM / mediapipeShoulderM);
}

/** Reads a persisted calibration. Safe on the server and when storage is off. */
export function loadCalibration(): StoredCalibration | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredCalibration>;
    const factor =
      typeof parsed?.factor === "number" ? clampCorrectionFactor(parsed.factor) : null;
    if (factor === null) return null;
    return {
      factor,
      reference: "a4",
      savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveCalibration(factor: number): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredCalibration = {factor, reference: "a4", savedAt: Date.now()};
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* storage unavailable — the factor still lives in memory this session */
  }
}

export function clearCalibration(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
