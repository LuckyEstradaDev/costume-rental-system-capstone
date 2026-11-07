/**
 * Body measurement + outfit fit helpers.
 *
 * Pure functions only (no React, no three.js) so the numbers are easy to tune.
 * Sizing is judged in INCHES — the unit the outfit's own measurements are
 * stored in. MediaPipe reports the body in metres, so the camera reading is
 * converted exactly once, at the inch boundary (`bideltoidFromJoint`).
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
  /** shoulder -> elbow -> wrist along the arm (metres), averaged over visible arms. */
  sleeveLength: number | null;
};

/**
 * Real garment measurements for one size, as stored on the outfit (inches).
 * `chest` is a circumference; `shoulder` and `sleeveLength` are flat lengths.
 */
export type GarmentMeasurements = {
  chest?: number;
  bust?: number;
  shoulder?: number;
  sleeveLength?: number;
  outfitLength?: number;
};

/** Per-size garment measurements, keyed by the size label (e.g. "M"). */
export type GarmentSizeMap = Record<string, GarmentMeasurements>;

export const FIT_CRITERION_KEYS = ["shoulder", "sleeve", "length"] as const;

export type FitCriterionKey = (typeof FIT_CRITERION_KEYS)[number];

export type FitCriterionKind =
  | "fits"
  | "too-tight"
  | "too-loose"
  | "too-short"
  | "too-long"
  | "unknown";

export type FitCriterionTone = "red" | "amber" | "green" | "neutral";

export type FitCriterion = {
  key: FitCriterionKey;
  kind: FitCriterionKind;
  /** short label for the always-on HUD chip */
  label: string;
  /** detailed warning text, or null when there is nothing to warn about */
  detail: string | null;
  tone: FitCriterionTone;
  /**
   * True when the verdict leaned on a generic chart instead of the outfit's
   * real measurement.
   */
  estimated: boolean;
};

export type FitResult = {
  /** estimated clothing size, e.g. "M" */
  size: string | null;
  criteria: FitCriterion[];
};

/**
 * Fallback outfit description, used only when the caller passes no size list
 * at all. `sizes` drives the fit warning.
 */
export const OUTFIT = {
  name: "Classic Tee",
  sizes: ["S", "M", "L"] as const,
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
 * Currently 4: a tailoring-style allowance added to the joint span before
 * comparing against the size chart or a garment's measurement.
 */
export const SHOULDER_JOINT_TO_BIDELTOID_IN = 4;

/**
 * Tailoring-style sleeve allowance, in inches. The tracked arm path runs from
 * the shoulder joint, not the garment seam, so this readjustment is added
 * before comparing against a garment's sleeve measurement.
 */
export const SLEEVE_LENGTH_ADJUSTMENT_IN = 4;

/**
 * Fit tolerance, in inches. A garment whose measurement sits within this
 * distance of the body (either direction) still counts as a fit.
 */
const FIT_TOLERANCE_IN = 2;

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

/** Adds the tailor's seam allowance to a raw shoulder width (metres). */
export function shoulderWithAllowanceM(shoulderWidthM: number): number {
  return shoulderWidthM + SHOULDER_JOINT_TO_BIDELTOID_IN * M_TO_M;
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

const positiveIn = (value?: number): number | null =>
  typeof value === "number" && value > 0 ? value : null;

const noDataCriterion = (key: FitCriterionKey, name: string): FitCriterion => ({
  key,
  kind: "unknown",
  label: `${name} no data`,
  detail: null,
  tone: "neutral",
  estimated: false,
});

type CriterionComparison = {
  key: FitCriterionKey;
  name: string;
  bodyIn: number;
  garmentIn: number;
  small: {
    kind: "too-tight" | "too-short";
    tone: "red" | "amber";
    text: string;
  };
  large: {
    kind: "too-loose" | "too-long";
    tone: "red" | "amber";
    text: string;
  };
};

/** Compares one garment measurement against the body within the fit tolerance. */
function compareCriterion({
  key,
  name,
  bodyIn,
  garmentIn,
  small,
  large,
}: CriterionComparison): FitCriterion {
  if (garmentIn < bodyIn - FIT_TOLERANCE_IN) {
    return {
      key,
      kind: small.kind,
      label: `${name} ${small.kind === "too-tight" ? "too tight" : "too short"}`,
      detail: small.text,
      tone: small.tone,
      estimated: false,
    };
  }
  if (garmentIn > bodyIn + FIT_TOLERANCE_IN) {
    return {
      key,
      kind: large.kind,
      label: `${name} ${large.kind === "too-loose" ? "too loose" : "too long"}`,
      detail: large.text,
      tone: large.tone,
      estimated: false,
    };
  }
  return {key, kind: "fits", label: `${name} fits`, detail: null, tone: "green", estimated: false};
}

function shoulderFromGarment(
  garmentIn: number,
  bodyIn: number,
  size: string,
): FitCriterion {
  return compareCriterion({
    key: "shoulder",
    name: "Shoulder",
    bodyIn,
    garmentIn,
    small: {
      kind: "too-tight",
      tone: "red",
      text: `Size ${size}'s shoulders measure ~${inches(garmentIn)} in; yours are ~${inches(bodyIn)} in. This size may be too tight.`,
    },
    large: {
      kind: "too-loose",
      tone: "amber",
      text: `Size ${size}'s shoulders measure ~${inches(garmentIn)} in; yours are ~${inches(bodyIn)} in. It will look oversized.`,
    },
  });
}

function shoulderFromChart(
  midIn: number,
  bodyIn: number,
  size: string,
  estimatedNote: string,
): FitCriterion {
  const criterion = compareCriterion({
    key: "shoulder",
    name: "Shoulder",
    bodyIn,
    garmentIn: midIn,
    small: {
      kind: "too-tight",
      tone: "red",
      text: `Size ${size}: your shoulders (~${inches(bodyIn)} in) are wider than this size's ~${inches(midIn)} in cut, so it may be too tight.${estimatedNote}`,
    },
    large: {
      kind: "too-loose",
      tone: "amber",
      text: `Size ${size}: your shoulders (~${inches(bodyIn)} in) are narrower than this size's ~${inches(midIn)} in cut, so it will look oversized.${estimatedNote}`,
    },
  });
  return {...criterion, estimated: true, label: `${criterion.label} (est.)`};
}

function shoulderFromRange(
  minMid: number,
  maxMid: number,
  bodyIn: number,
  size: string,
  sizeRange: string,
  estimatedNote: string,
): FitCriterion {
  if (bodyIn > maxMid + FIT_TOLERANCE_IN) {
    return {
      key: "shoulder",
      kind: "too-tight",
      label: "Shoulder too tight (est.)",
      detail: `Size ${size}: this outfit is cut ${sizeRange}. Your shoulders (~${inches(bodyIn)} in) are wider than its fit range, so it may be too tight.${estimatedNote}`,
      tone: "red",
      estimated: true,
    };
  }
  if (bodyIn < minMid - FIT_TOLERANCE_IN) {
    return {
      key: "shoulder",
      kind: "too-loose",
      label: "Shoulder too loose (est.)",
      detail: `Size ${size}: this outfit is cut ${sizeRange}. It will look oversized on you.${estimatedNote}`,
      tone: "amber",
      estimated: true,
    };
  }
  return {
    key: "shoulder",
    kind: "fits",
    label: "Shoulder fits (est.)",
    detail: null,
    tone: "green",
    estimated: true,
  };
}

function sleeveCriterion(
  sleeveLengthM: number | null,
  garment: GarmentMeasurements | undefined,
  size: string,
): FitCriterion {
  if (sleeveLengthM === null || !Number.isFinite(sleeveLengthM) || sleeveLengthM <= 0) {
    return noDataCriterion("sleeve", "Sleeve");
  }
  const garmentIn = positiveIn(garment?.sleeveLength);
  if (garmentIn === null) return noDataCriterion("sleeve", "Sleeve");

  const bodyIn = sleeveLengthM * M_TO_IN + SLEEVE_LENGTH_ADJUSTMENT_IN;
  return compareCriterion({
    key: "sleeve",
    name: "Sleeve",
    bodyIn,
    garmentIn,
    small: {
      kind: "too-short",
      tone: "red",
      text: `Size ${size}'s sleeves measure ~${inches(garmentIn)} in; your arm is ~${inches(bodyIn)} in. They may be too short.`,
    },
    large: {
      kind: "too-long",
      tone: "amber",
      text: `Size ${size}'s sleeves measure ~${inches(garmentIn)} in; your arm is ~${inches(bodyIn)} in. They may be too long.`,
    },
  });
}

function lengthCriterion(
  torsoLengthM: number | null,
  garment: GarmentMeasurements | undefined,
  size: string,
): FitCriterion {
  if (torsoLengthM === null || !Number.isFinite(torsoLengthM) || torsoLengthM <= 0) {
    return noDataCriterion("length", "Length");
  }
  const garmentIn = positiveIn(garment?.outfitLength);
  if (garmentIn === null) return noDataCriterion("length", "Length");

  const bodyIn = torsoLengthM * M_TO_IN;
  return compareCriterion({
    key: "length",
    name: "Outfit length",
    bodyIn,
    garmentIn,
    small: {
      kind: "too-short",
      tone: "amber",
      text: `Size ${size} is ~${inches(garmentIn)} in long while your torso is ~${inches(bodyIn)} in. It may ride up.`,
    },
    large: {
      kind: "too-long",
      tone: "amber",
      text: `Size ${size} is ~${inches(garmentIn)} in long while your torso is ~${inches(bodyIn)} in. It may hang too long.`,
    },
  });
}

/**
 * Decides how well the outfit fits. Everything here is judged in INCHES.
 *
 * - **Auto** (`pickedSize` null): estimates the user's size and checks it
 *   against the sizes this outfit is cut in (`outfitSizes`).
 * - **Picked size**: judges the size the user chose against their body.
 *
 * Each available criterion (shoulder, sleeve, length) gets its own
 * verdict. Sizes without a real shoulder measurement fall back to the chart
 * and are flagged `estimated`; missing body/garment data becomes `unknown`.
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
    return {size: null, criteria: []};
  }

  const bideltoid = bideltoidFromJoint(measurements.shoulderWidth);
  const measuredSize = sizeFromShoulderWidth(bideltoid, previousSize);
  const estimatedNote = " (estimated because this size has no usable measurements)";

  let judgedSize = measuredSize;
  let shoulder: FitCriterion;

  // The user picked a size: is THAT size right for this body?
  if (pickedSize) {
    judgedSize = pickedSize;
    const garment = garmentFor(pickedSize, garmentSizes);

    if (hasShoulder(garment)) {
      shoulder = shoulderFromGarment(garment.shoulder, bideltoid, pickedSize);
    } else {
      const pickedMid = SIZE_MIDPOINT[pickedSize];
      shoulder =
        typeof pickedMid === "number"
          ? shoulderFromChart(pickedMid, bideltoid, pickedSize, estimatedNote)
          : noDataCriterion("shoulder", "Shoulder");
    }
  } else {
    // Auto: compare the body with the sizes this outfit is cut in.
    const sizes = normalizeOutfitSizes(outfitSizes);
    if (sizes.length === 0) return {size: null, criteria: []};

    judgedSize = sizes.includes(measuredSize)
      ? measuredSize
      : nearestOffered(measuredSize, sizes);
    const garment = garmentFor(judgedSize, garmentSizes);

    if (hasShoulder(garment)) {
      shoulder = shoulderFromGarment(garment.shoulder, bideltoid, judgedSize);
    } else {
      const sizeRange = `${sizes[0]}-${sizes[sizes.length - 1]}`;
      const minMid = SIZE_MIDPOINT[sizes[0]];
      const maxMid = SIZE_MIDPOINT[sizes[sizes.length - 1]];
      shoulder =
        typeof minMid === "number" && typeof maxMid === "number"
          ? shoulderFromRange(minMid, maxMid, bideltoid, measuredSize, sizeRange, estimatedNote)
          : noDataCriterion("shoulder", "Shoulder");
    }
  }

  const garment = garmentFor(judgedSize, garmentSizes);
  return {
    size: judgedSize,
    criteria: [
      shoulder,
      sleeveCriterion(measurements.sleeveLength, garment, judgedSize),
      lengthCriterion(measurements.torsoLength, garment, judgedSize),
    ],
  };
}

const distance = (a: Point3, b: Point3) =>
  Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

const midpoint = (a: Point3, b: Point3): Point3 => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
  z: (a.z + b.z) / 2,
});

/** One arm's shoulder -> elbow -> wrist length, or null when a joint is hidden. */
function armLength(
  shoulder: MeasuredPoint | undefined,
  elbow: MeasuredPoint | undefined,
  wrist: MeasuredPoint | undefined,
): number | null {
  if (!shoulder || !elbow || !wrist) return null;
  if (
    (shoulder.visibility ?? 1) < MEASURE_VIS_MIN ||
    (elbow.visibility ?? 1) < MEASURE_VIS_MIN ||
    (wrist.visibility ?? 1) < MEASURE_VIS_MIN
  ) {
    return null;
  }

  const length = distance(shoulder, elbow) + distance(elbow, wrist);
  return length >= 0.2 && length <= 1.2 ? length : null;
}

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
 * the torso entry is `null` while the hips are out of frame or the tracker is
 * not confident about them, so a cropped upper body still yields a size
 * estimate.
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

  if (
    leftShoulder &&
    rightShoulder &&
    leftHip &&
    rightHip &&
    (leftHip.visibility ?? 1) >= MEASURE_VIS_MIN &&
    (rightHip.visibility ?? 1) >= MEASURE_VIS_MIN
  ) {
    const shoulderMid = midpoint(leftShoulder, rightShoulder);
    const hipMid = midpoint(leftHip, rightHip);
    const candidateTorso = distance(shoulderMid, hipMid);

    // Sanity checks: a torso is never shorter than half the shoulders are
    // wide, and shoulder/hip lines must be clearly separated vertically (the
    // y axis points differently in image vs world landmarks, so compare
    // magnitudes only).
    if (
      candidateTorso >= shoulderWidth * 0.4 &&
      Math.abs(hipMid.y - shoulderMid.y) >= 0.1
    ) {
      torsoLength = candidateTorso;
    }
  }

  const armLengths = [
    armLength(world[11], world[13], world[15]),
    armLength(world[12], world[14], world[16]),
  ].filter((value): value is number => value !== null);
  const sleeveLength = armLengths.length
    ? armLengths.reduce((sum, value) => sum + value, 0) / armLengths.length
    : null;

  return {shoulderWidth, torsoLength, sleeveLength};
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
