/**
 * Body measurement + outfit fit helpers.
 *
 * Pure functions only (no React, no three.js) so the numbers are easy to tune.
 * Sizing is judged in INCHES — the unit the outfit's own measurements are
 * stored in. MediaPipe reports the body in metres, so the camera reading is
 * converted exactly once, at this boundary (`bideltoidFromJoint`).
 */

export type Point3 = {x: number; y: number; z: number};

/** A landmark that may carry a MediaPipe visibility score (0-1). */
type MeasuredPoint = Point3 & {visibility?: number};

export type BodyMeasurements = {
  /** shoulder joint (landmark 11) to shoulder joint (landmark 12), metres */
  shoulderWidth: number;
  /**
   * mid-shoulder to mid-hip, metres.
   * `null` when the hips are out of frame — only the length check is skipped.
   */
  torsoLength: number | null;
  /** hip (23) to hip (24), metres. `null` when the hips are not in frame. */
  hipWidth: number | null;
};

/**
 * Real garment measurements for one size, as stored on the outfit (inches).
 * Only `shoulder` (seam-to-seam width) and `outfitLength` feed the verdict
 * today; the rest are accepted so the map can be built straight from the
 * outfit payload.
 */
export type GarmentMeasurements = {
  chest?: number;
  bust?: number;
  shoulder?: number;
  outfitLength?: number;
};

/** Per-size garment measurements, keyed by the size label (e.g. "M"). */
export type GarmentSizeMap = Record<string, GarmentMeasurements>;

export type FitKind =
  | "too-tight"
  | "too-loose"
  | "length"
  | "fits"
  | "unknown";

export type FitResult = {
  kind: FitKind;
  /** estimated clothing size, e.g. "M" */
  size: string | null;
  /** message for the toast banner, or null when there is nothing to warn about */
  toast: string | null;
  tone: "red" | "amber" | "green" | null;
  /**
   * True when the verdict leaned on a generic chart/range instead of the
   * outfit's real measurements (a size with no usable garment data).
   */
  estimated: boolean;
};

/**
 * Fallback outfit description, used only when the caller passes no size list
 * at all. Tune these values to match your garment:
 *  - `sizes`: which sizes the model is made in (drives the fit warning)
 *  - `torsoLengthRange`: torso length (inches) the cut can cover — used only
 *    for outfits whose sizes carry no real measurements
 */
export const OUTFIT = {
  name: "Classic Tee",
  sizes: ["S", "M", "L"] as const,
  /**
   * Torso length (inches) the cut can cover. Kept generous on purpose: tighten
   * it once you have watched real measurements come in.
   */
  torsoLengthRange: [16, 31] as const,
};

/** Standard body shoulder-width chart (inches). Ordered widest first. */
const SIZE_CHART: Array<{size: string; minShoulder: number}> = [
  {size: "XL", minShoulder: 19},
  {size: "L", minShoulder: 17.5},
  {size: "M", minShoulder: 16},
  {size: "S", minShoulder: 14.5},
  {size: "XS", minShoulder: 0},
];

export const SIZE_ORDER = ["XS", "S", "M", "L", "XL"];

/**
 * Shoulder-width midpoint of each size (inches), used to scale the garment to
 * the size the user picked: a picked XL is rendered this much roomier than
 * the size the body actually measures.
 */
export const SIZE_MIDPOINT: Record<string, number> = {
  XS: 13.5,
  S: 15.25,
  M: 16.75,
  L: 18.25,
  XL: 20.25,
};

/** MediaPipe reports metres; the sizing layer judges in inches. */
const M_TO_IN = 1 / 0.0254;

/** Inches to metres, for turning a garment measurement into model units. */
const M_TO_M = 0.0254;

/** One decimal place, for turning a measurement into a toast number. */
const inches = (value: number) => Math.round(value * 10) / 10;

/**
 * MediaPipe's shoulder landmarks (11/12) are the shoulder *joints*, which sit
 * inside the outer deltoid — where a garment's shoulder seam lands. Add the
 * per-side gap here (in total inches) to reach the seam-to-seam width before
 * comparing against the size chart or a garment's measurement.
 *
 * Currently 0: the raw joint span is used as-is (no padding). Raise this to
 * ~3 (1.5 in per side) if you calibrate the chart to seam-to-seam widths.
 */
export const SHOULDER_JOINT_TO_BIDELTOID_IN = 0;

/**
 * Shoulder allowance, in inches. A garment whose shoulder width sits within
 * this distance of the body (either direction) reads as a fit; beyond it the
 * garment is too tight (narrower) or too loose (wider).
 */
const SHOULDER_TOL_IN = 4;

/** Garment length below this fraction of the torso may ride up. */
const LENGTH_SHORT_FRACTION = 0.85;

/** Minimum world-landmark visibility before a measurement is trusted. */
const MEASURE_VIS_MIN = 0.6;

/**
 * How much bigger the garment renders for a picked size, relative to the size
 * the model was authored at (`baseSize`). A picked L is physically roomier than
 * a base-M model, so the mesh is scaled by their real size-chart ratio. Returns
 * `1` (base size / Auto) when no size is picked.
 */
export function sizeRenderFactor(
  pickedSize: string | null | undefined,
  baseSize: string = "M",
): number {
  if (!pickedSize) return 1;
  const picked = SIZE_MIDPOINT[pickedSize];
  const base = SIZE_MIDPOINT[baseSize];
  if (!picked || !base || base <= 0) return 1;
  return picked / base;
}

/**
 * How big to render the garment for a picked size along ONE dimension, driven
 * by the outfit's real measurements rather than the generic chart. Priority:
 *  1. absolute — the model's authored span (`modelMetres`) is known, so the
 *     mesh renders at the picked size's real measurement;
 *  2. real cut ratio — picked measurement / the base size's measurement;
 *  3. generic size chart (shoulder only); otherwise 1.
 * `Auto`/no data returns 1. Returns null when the absolute ratio is implausible,
 * so the caller can fall through instead of distorting the mesh.
 */
export function measurementRenderFactor(
  pickedSize: string | null | undefined,
  baseSize: string,
  sizeMap: GarmentSizeMap | undefined,
  field: "shoulder" | "outfitLength",
  modelMetres: number | null,
): number {
  const chartFallback = () => (field === "shoulder" ? sizeRenderFactor(pickedSize, baseSize) : 1);
  if (!pickedSize) return 1;

  const pickedIn = sizeMap?.[pickedSize]?.[field];
  if (typeof pickedIn !== "number" || pickedIn <= 0) return chartFallback();

  // 1. Absolute against the model's authored span (kept within a sane band).
  if (typeof modelMetres === "number" && modelMetres > 0) {
    const factor = (pickedIn * M_TO_M) / modelMetres;
    if (factor >= MODEL_FACTOR_MIN && factor <= MODEL_FACTOR_MAX) return factor;
  }

  // 2. Real cut ratio against the base size.
  const baseIn = sizeMap?.[baseSize]?.[field];
  if (typeof baseIn === "number" && baseIn > 0) return pickedIn / baseIn;

  // 3. Generic chart.
  return chartFallback();
}

/** Plausible band for an absolute (model-relative) render factor. */
const MODEL_FACTOR_MIN = 0.5;
const MODEL_FACTOR_MAX = 2;

/**
 * Deadband so a measurement sitting right on a size boundary does not make the
 * chip flicker between two letters.
 */
const SIZE_HYSTERESIS = 0.25;

function rawSize(shoulderWidth: number): string {
  for (const entry of SIZE_CHART) {
    if (shoulderWidth >= entry.minShoulder) return entry.size;
  }
  return "XS";
}

/** Lower/upper shoulder-width bounds of a size letter. */
function sizeBand(size: string): {lo: number; hi: number} {
  const lo = SIZE_CHART.find((entry) => entry.size === size)?.minShoulder ?? 0;
  const hi = SIZE_CHART.filter((entry) => entry.minShoulder > lo).reduce(
    (smallest, entry) => Math.min(smallest, entry.minShoulder),
    Number.POSITIVE_INFINITY,
  );
  return {lo, hi};
}

/**
 * Maps body shoulder width (inches, seam-to-seam — run the raw MediaPipe joint
 * span through `bideltoidFromJoint` first) to a clothing size.
 * Pass the previously shown size to get a small deadband around boundaries.
 */
export function sizeFromShoulderWidth(
  shoulderWidth: number,
  previousSize?: string | null,
): string {
  const size = rawSize(shoulderWidth);
  if (!previousSize || previousSize === size) return size;
  if (Math.abs(SIZE_ORDER.indexOf(size) - SIZE_ORDER.indexOf(previousSize)) !== 1) {
    return size;
  }

  const band = sizeBand(previousSize);
  const goingUp = SIZE_ORDER.indexOf(size) > SIZE_ORDER.indexOf(previousSize);
  const clearlyPastEdge = goingUp
    ? shoulderWidth > band.hi + SIZE_HYSTERESIS
    : shoulderWidth < band.lo - SIZE_HYSTERESIS;

  return clearlyPastEdge ? size : previousSize;
}

/**
 * Keeps only known sizes, sorted from smallest to largest.
 * `undefined` falls back to `OUTFIT.sizes`; an explicit empty list stays empty
 * (so filtering out unusable sizes cannot resurrect phantom defaults).
 */
export function normalizeOutfitSizes(sizes?: readonly string[]): string[] {
  if (sizes === undefined) return [...OUTFIT.sizes];
  const known = sizes.filter((size) => SIZE_ORDER.includes(size));
  return [...new Set(known)].sort(
    (a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b),
  );
}

/**
 * Converts MediaPipe's joint-to-joint shoulder span (metres) into the
 * seam-to-seam width a garment's "shoulder" measurement refers to, in INCHES.
 */
export function bideltoidFromJoint(shoulderWidthM: number): number {
  return shoulderWidthM * M_TO_IN + SHOULDER_JOINT_TO_BIDELTOID_IN;
}

/** Case-insensitive lookup of a size's garment measurements. */
function garmentFor(
  size: string,
  map?: GarmentSizeMap,
): GarmentMeasurements | undefined {
  if (!map) return undefined;
  const wanted = size.trim().toUpperCase();
  const key = Object.keys(map).find((k) => k.trim().toUpperCase() === wanted);
  return key ? map[key] : undefined;
}

const hasShoulder = (
  garment: GarmentMeasurements | undefined,
): garment is GarmentMeasurements & {shoulder: number} =>
  typeof garment?.shoulder === "number" && garment.shoulder > 0;

/**
 * Compares a garment's real shoulder width (inches) against the body (inches).
 * Returns null when the numbers are within tolerance (a fit) or unavailable.
 */
function shoulderVerdict(
  garment: GarmentMeasurements | undefined,
  bideltoidIn: number,
): {kind: "too-tight" | "too-loose"; garmentIn: number} | null {
  if (!hasShoulder(garment)) return null;
  const garmentIn = garment.shoulder;
  if (garmentIn < bideltoidIn - SHOULDER_TOL_IN) return {kind: "too-tight", garmentIn};
  if (garmentIn > bideltoidIn + SHOULDER_TOL_IN) return {kind: "too-loose", garmentIn};
  return null;
}

/** Offered size closest to the measured one (ties prefer the roomier size). */
function nearestOffered(target: string, offered: string[]): string {
  const targetIndex = SIZE_ORDER.indexOf(target);
  return offered.reduce((best, size) => {
    const gap = Math.abs(SIZE_ORDER.indexOf(size) - targetIndex);
    const bestGap = Math.abs(SIZE_ORDER.indexOf(best) - targetIndex);
    if (gap < bestGap) return size;
    if (gap === bestGap && SIZE_ORDER.indexOf(size) > SIZE_ORDER.indexOf(best)) {
      return size;
    }
    return best;
  });
}

/** Real garment length in inches, when the size carries one. */
function garmentLengthIn(garment?: GarmentMeasurements): number | null {
  const value = garment?.outfitLength;
  return typeof value === "number" && value > 0 ? value : null;
}

/**
 * Decides how well the outfit fits. Everything here is judged in INCHES.
 *
 * - **Auto** (`pickedSize` null): estimates the user's size and checks it
 *   against the sizes this outfit is cut in (`outfitSizes`).
 * - **Picked size**: judges the size the user chose against their body.
 *
 * When a size carries real garment measurements (`garmentSizes`, inches) they
 * take precedence: shoulders are compared as actual inches and the real outfit
 * length replaces the fallback torso range. Sizes without the needed data fall
 * back to the chart logic and are flagged `estimated`.
 *
 * Warnings are ordered by importance: too tight (red) > too loose / wrong
 * length (amber) > fits (green).
 */
export function evaluateFit(
  measurements: BodyMeasurements | null,
  previousSize?: string | null,
  pickedSize?: string | null,
  outfitSizes?: readonly string[],
  garmentSizes?: GarmentSizeMap,
): FitResult {
  if (
    !measurements ||
    !Number.isFinite(measurements.shoulderWidth) ||
    measurements.shoulderWidth <= 0
  ) {
    return {kind: "unknown", size: null, toast: null, tone: null, estimated: false};
  }

  const bideltoid = bideltoidFromJoint(measurements.shoulderWidth);
  const measuredSize = sizeFromShoulderWidth(bideltoid, previousSize);
  const bodyIn = inches(bideltoid);
  const estimatedNote = " (estimated — this size has no usable measurements)";

  let judgedSize = measuredSize;

  // The user picked a size: is THAT size right for this body?
  if (pickedSize) {
    judgedSize = pickedSize;
    const garment = garmentFor(pickedSize, garmentSizes);

    if (hasShoulder(garment)) {
      // Real numbers beat letters: compare the garment's own shoulder width.
      const verdict = shoulderVerdict(garment, bideltoid);
      if (verdict?.kind === "too-tight") {
        return {
          kind: "too-tight",
          size: pickedSize,
          tone: "red",
          estimated: false,
          toast: `Size ${pickedSize}'s shoulders measure ~${inches(verdict.garmentIn)} in; yours are ~${bodyIn} in — this size may be too tight.`,
        };
      }
      if (verdict?.kind === "too-loose") {
        return {
          kind: "too-loose",
          size: pickedSize,
          tone: "amber",
          estimated: false,
          toast: `Size ${pickedSize}'s shoulders measure ~${inches(verdict.garmentIn)} in; yours are ~${bodyIn} in — it will look oversized.`,
        };
      }
    } else {
      const pickedMid = SIZE_MIDPOINT[pickedSize];
      if (typeof pickedMid === "number") {
        if (bideltoid > pickedMid + SHOULDER_TOL_IN) {
          return {
            kind: "too-tight",
            size: pickedSize,
            tone: "red",
            estimated: true,
            toast: `Size ${pickedSize} — your shoulders (~${bodyIn} in) are wider than this size's ~${inches(pickedMid)} in cut, so it may be too tight.${estimatedNote}`,
          };
        }
        if (bideltoid < pickedMid - SHOULDER_TOL_IN) {
          return {
            kind: "too-loose",
            size: pickedSize,
            tone: "amber",
            estimated: true,
            toast: `Size ${pickedSize} — your shoulders (~${bodyIn} in) are narrower than this size's ~${inches(pickedMid)} in cut, so it will look oversized.${estimatedNote}`,
          };
        }
      }
    }
  } else {
    // Auto: compare the body with the sizes this outfit is cut in.
    const sizes = normalizeOutfitSizes(outfitSizes);
    judgedSize = sizes.includes(measuredSize)
      ? measuredSize
      : nearestOffered(measuredSize, sizes);
    const garment = garmentFor(judgedSize, garmentSizes);

    if (hasShoulder(garment)) {
      const verdict = shoulderVerdict(garment, bideltoid);
      if (verdict?.kind === "too-tight") {
        return {
          kind: "too-tight",
          size: judgedSize,
          tone: "red",
          estimated: false,
          toast: `Size ${judgedSize} is the closest cut (~${inches(verdict.garmentIn)} in shoulders), but your ~${bodyIn} in shoulders will feel tight.`,
        };
      }
      if (verdict?.kind === "too-loose") {
        return {
          kind: "too-loose",
          size: judgedSize,
          tone: "amber",
          estimated: false,
          toast: `Size ${judgedSize} is the closest cut (~${inches(verdict.garmentIn)} in shoulders) and will look oversized on your ~${bodyIn} in shoulders.`,
        };
      }
    } else if (sizes.length > 0) {
      const sizeRange = `${sizes[0]}-${sizes[sizes.length - 1]}`;
      const minMid = SIZE_MIDPOINT[sizes[0]];
      const maxMid = SIZE_MIDPOINT[sizes[sizes.length - 1]];

      if (typeof maxMid === "number" && bideltoid > maxMid + SHOULDER_TOL_IN) {
        return {
          kind: "too-tight",
          size: measuredSize,
          tone: "red",
          estimated: true,
          toast: `Size ${measuredSize} — this outfit is cut ${sizeRange}. Your shoulders (~${bodyIn} in) are wider than its fit range, so it may be too tight.${estimatedNote}`,
        };
      }

      if (typeof minMid === "number" && bideltoid < minMid - SHOULDER_TOL_IN) {
        return {
          kind: "too-loose",
          size: measuredSize,
          tone: "amber",
          estimated: true,
          toast: `Size ${measuredSize} — this outfit is cut ${sizeRange}. It will look oversized on you.${estimatedNote}`,
        };
      }
    } else {
      // No offered sizes at all to compare against — nothing to judge.
      return {kind: "unknown", size: null, toast: null, tone: null, estimated: false};
    }
  }

  // The size is right — is the length?
  const torsoLength = measurements.torsoLength;
  if (torsoLength !== null) {
    const torsoIn = torsoLength * M_TO_IN;
    const garment = garmentFor(judgedSize, garmentSizes);
    const lengthIn = garmentLengthIn(garment);
    if (lengthIn !== null) {
      // Real garment length: it may only be too SHORT (riding up). A long
      // garment is not flagged — dresses and coats are supposed to be long.
      if (lengthIn < torsoIn * LENGTH_SHORT_FRACTION) {
        return {
          kind: "length",
          size: judgedSize,
          tone: "amber",
          estimated: false,
          toast: `Size ${judgedSize} is ~${inches(lengthIn)} in long while your torso is ~${inches(torsoIn)} in — it may ride up.`,
        };
      }
    } else {
      const [minTorso, maxTorso] = OUTFIT.torsoLengthRange;
      if (torsoIn < minTorso) {
        return {
          kind: "length",
          size: judgedSize,
          tone: "amber",
          estimated: true,
          toast: `Size ${judgedSize} — your torso is shorter than this outfit's cut, so it may hang too long.${estimatedNote}`,
        };
      }
      if (torsoIn > maxTorso) {
        return {
          kind: "length",
          size: judgedSize,
          tone: "amber",
          estimated: true,
          toast: `Size ${judgedSize} — your torso is longer than this outfit's cut, so it may ride up.${estimatedNote}`,
        };
      }
    }
  }

  return {kind: "fits", size: judgedSize, tone: "green", toast: null, estimated: false};
}

/** Short label for the always-on chip in the top-left corner. */
export function fitChipLabel(result: FitResult): string | null {
  if (!result.size || result.kind === "unknown") return null;
  const est = result.estimated ? " (est.)" : "";
  switch (result.kind) {
    case "too-tight":
      return `Size ${result.size} · too tight${est}`;
    case "too-loose":
      return `Size ${result.size} · too loose${est}`;
    case "length":
      return `Size ${result.size} · length mismatch${est}`;
    default:
      return `Size ${result.size} · fits${est}`;
  }
}

const distance = (a: Point3, b: Point3) =>
  Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

const midpoint = (a: Point3, b: Point3): Point3 => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
  z: (a.z + b.z) / 2,
});

/**
 * Shoulder width alone — enough for the size estimate. Rejects joints the
 * tracker is not confident about (occluded or off-frame shoulders).
 */
export function measureShoulders(world: MeasuredPoint[] | undefined): number | null {
  if (!world) return null;

  const leftShoulder = world[11];
  const rightShoulder = world[12];
  if (!leftShoulder || !rightShoulder) return null;
  if (
    (leftShoulder.visibility ?? 1) < MEASURE_VIS_MIN ||
    (rightShoulder.visibility ?? 1) < MEASURE_VIS_MIN
  ) {
    return null;
  }

  const shoulderWidth = distance(leftShoulder, rightShoulder);
  // Sanity check: rejects collapsed or extrapolated skeletons. Adult joint
  // spans land around 0.25-0.55 m; the window is generous but excludes junk.
  if (shoulderWidth < 0.22 || shoulderWidth > 0.65) return null;

  return shoulderWidth;
}

/**
 * Full body dimensions. Always returns the shoulder width when it is usable;
 * the torso/hip entries are `null` while the hips are out of frame or the
 * tracker is not confident about them, so a cropped upper body still yields a
 * size estimate.
 */
export function measureBody(
  world: MeasuredPoint[] | undefined,
): BodyMeasurements | null {
  const shoulderWidth = measureShoulders(world);
  if (shoulderWidth === null || !world) return null;

  const leftShoulder = world[11];
  const rightShoulder = world[12];
  const leftHip = world[23];
  const rightHip = world[24];

  let torsoLength: number | null = null;
  let hipWidth: number | null = null;

  if (
    leftShoulder &&
    rightShoulder &&
    leftHip &&
    rightHip &&
    (leftHip.visibility ?? 1) >= MEASURE_VIS_MIN &&
    (rightHip.visibility ?? 1) >= MEASURE_VIS_MIN
  ) {
    const candidateHipWidth = distance(leftHip, rightHip);
    const shoulderMid = midpoint(leftShoulder, rightShoulder);
    const hipMid = midpoint(leftHip, rightHip);
    const candidateTorso = distance(shoulderMid, hipMid);

    // Sanity checks: hips never wider than a metre, a torso is never shorter
    // than half the shoulders are wide, and shoulder/hip lines must be clearly
    // separated vertically (the y axis points differently in image vs world
    // landmarks, so compare magnitudes only).
    if (candidateHipWidth >= 0.05 && candidateHipWidth <= 1.0) {
      hipWidth = candidateHipWidth;
    }
    if (
      candidateTorso >= shoulderWidth * 0.4 &&
      Math.abs(hipMid.y - shoulderMid.y) >= 0.1
    ) {
      torsoLength = candidateTorso;
    }
  }

  return {shoulderWidth, torsoLength, hipWidth};
}

/**
 * Pushes a value into a bounded rolling window and returns the window's
 * median. One frame of motion blur or a limb crossing a joint cannot skew the
 * median, so it runs before the EMA as an outlier filter.
 */
export function medianWindow(window: number[], value: number, maxLen = 5): number {
  window.push(value);
  if (window.length > maxLen) window.splice(0, window.length - maxLen);
  const sorted = [...window].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Exponential moving average used to stop measurements from jittering. */
export function ema(previous: number | null, next: number, alpha = 0.15): number {
  if (previous === null || !Number.isFinite(previous)) return next;
  return previous + alpha * (next - previous);
}
