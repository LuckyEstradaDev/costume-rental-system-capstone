# Removed AR code (archive)

These pieces were removed during the AR dead-code cleanup because the chest
criterion was disabled and its measurement pipeline was no longer consumed.
Keep this file if chest/hip checks are restored later.

To re-enable chest checks, re-add `"chest"` to `FIT_CRITERION_KEYS` in
`lib/bodyFit.ts`, add `chest: "Chest"` back to `CRITERION_LABELS` in
`components/Hud.tsx`, then restore the pieces below.

## 1. Chest criterion (`lib/bodyFit.ts`)

```ts
function chestCriterion(
  chestWidthM: number | null,
  garment: GarmentMeasurements | undefined,
  size: string,
): FitCriterion {
  if (chestWidthM === null || !Number.isFinite(chestWidthM) || chestWidthM <= 0) {
    return noDataCriterion("chest", "Chest");
  }
  const garmentIn = positiveIn(garment?.chest);
  if (garmentIn === null) return noDataCriterion("chest", "Chest");

  const bodyIn = chestCircumferenceIn(chestWidthM);
  return compareCriterion({
    key: "chest",
    name: "Chest",
    bodyIn,
    garmentIn,
    small: {
      kind: "too-tight",
      tone: "red",
      text: `Size ${size}'s chest measures ~${inches(garmentIn)} in; your chest is ~${inches(bodyIn)} in. It may be too tight.`,
    },
    large: {
      kind: "too-loose",
      tone: "amber",
      text: `Size ${size}'s chest measures ~${inches(garmentIn)} in; your chest is ~${inches(bodyIn)} in. It will look oversized.`,
    },
  });
}
```

Call inside `evaluateFit`:

```ts
    criteria: [
      shoulder,
      chestCriterion(measurements.chestWidth, garment, judgedSize),
      sleeveCriterion(measurements.sleeveLength, garment, judgedSize),
      lengthCriterion(measurements.torsoLength, garment, judgedSize),
    ],
```

## 2. Chest measurement helpers (`lib/bodyFit.ts`)

```ts
/**
 * Tailoring-style chest allowance, in inches. MediaPipe only sees a flat
 * frontal width, so this readjustment is added before comparing against a
 * garment's circumference measurement.
 */
export const CHEST_CIRCUMFERENCE_ADJUSTMENT_IN = 4;

/** Approximates chest circumference (inches) from MediaPipe's chest width (metres). */
export function chestCircumferenceIn(chestWidthM: number): number {
  return chestWidthM * 2 * M_TO_IN + CHEST_CIRCUMFERENCE_ADJUSTMENT_IN;
}
```

## 3. Chest width config (`config.ts`)

```ts
/** Chest width approximation from the shoulder-joint span (no chest landmark). */
export const CHEST_WIDTH_FROM_SHOULDER = 1.12;
```

## 4. Hip/chest measurement fields (`lib/bodyFit.ts`)

```ts
export type BodyMeasurements = {
  shoulderWidth: number;
  torsoLength: number | null;
  /** hip (23) to hip (24), metres. `null` when the hips are not in frame. */
  hipWidth: number | null;
  /** estimated chest width (metres); MediaPipe has no chest landmark. */
  chestWidth: number | null;
  sleeveLength: number | null;
};
```

Old `measureBody` body:

```ts
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

  const chestWidth =
    Number.isFinite(CHEST_WIDTH_FROM_SHOULDER) && CHEST_WIDTH_FROM_SHOULDER > 0
      ? shoulderWidth * CHEST_WIDTH_FROM_SHOULDER
      : null;

  return {shoulderWidth, torsoLength, hipWidth, chestWidth, sleeveLength};
```

## 5. Runtime state (`types.ts`, `runtime.ts`)

```ts
/** Smoothed body measurements (metres) and the last estimated size letter. */
export type ARBody = {
  shoulder: number | null;
  torso: number | null;
  hip: number | null;
  chest: number | null;
  sleeve: number | null;
  size: string | null;
};
```

```ts
  windows: {
    shoulder: number[];
    torso: number[];
    hip: number[];
    chest: number[];
    sleeve: number[];
  };
```

```ts
    body: {shoulder: null, torso: null, hip: null, chest: null, sleeve: null, size: null},
    windows: {shoulder: [], torso: [], hip: [], chest: [], sleeve: []},
```

## 6. Smoothing and fit mapping (`lib/fitFeedback.ts`)

```ts
  if (measured.hipWidth !== null) {
    body.hip = ema(body.hip, medianWindow(windows.hip, measured.hipWidth), emaAlpha);
  }
  if (measured.chestWidth !== null) {
    body.chest = ema(body.chest, medianWindow(windows.chest, measured.chestWidth), emaAlpha);
  }
```

```ts
      ? {
          shoulderWidth: body.shoulder,
          torsoLength: body.torso,
          hipWidth: body.hip,
          chestWidth: body.chest,
          sleeveLength: body.sleeve,
        }
      : null;
```

```ts
      ? {
          shoulderWidth: measurements.shoulderWidth * k,
          torsoLength: measurements.torsoLength === null ? null : measurements.torsoLength * k,
          hipWidth: measurements.hipWidth === null ? null : measurements.hipWidth * k,
          chestWidth: measurements.chestWidth === null ? null : measurements.chestWidth * k,
          sleeveLength: measurements.sleeveLength === null ? null : measurements.sleeveLength * k,
        }
```

## 7. Debug readout (`lib/poseDebug.ts`, `hooks/usePoseTracking.ts`)

```ts
export type PoseDebugReadout = {
  shoulderM: number | null;
  torsoM: number | null;
  hipM: number | null;
  chestCircumferenceM: number | null;
  sleeveM: number | null;
};
```

```ts
    `Shoulders (tailored) ${inches(readout.shoulderM)}`,
    `Chest (circ.) ${inches(readout.chestCircumferenceM)}`,
    `Hips ${inches(readout.hipM)}`,
```

```ts
import {
  CHEST_CIRCUMFERENCE_ADJUSTMENT_IN,
  measureBody,
  shoulderWithAllowanceM,
} from "../lib/bodyFit";
```

```ts
              hipM: null,
              chestCircumferenceM: null,
```

```ts
              hipM: runtime.body.hip,
              chestCircumferenceM:
                runtime.body.chest === null
                  ? null
                  : runtime.body.chest * 2 + CHEST_CIRCUMFERENCE_ADJUSTMENT_IN * 0.0254,
```

## Retained

`GarmentMeasurements.chest` and `bust` remain because the browse page still
supplies them in `sizeMeasurements`. They are simply unused by the current fit
criteria.
