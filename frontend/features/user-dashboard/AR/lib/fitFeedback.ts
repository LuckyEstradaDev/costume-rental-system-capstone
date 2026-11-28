import {POSE_HOLD_MS} from "../config";
import type {ARRuntime} from "../types";
import {ema, medianWindow, type BodyMeasurements} from "./bodyFit";

/** Feeds one frame of measurements through a median pre-filter then the EMA. */
export function smoothBody(
  runtime: Pick<ARRuntime, "body" | "windows" | "lastMeasuredAt">,
  measured: BodyMeasurements | null,
  emaAlpha: number,
  now: number,
): void {
  const values = {shoulder: measured?.shoulderWidth, torso: measured?.torsoLength, sleeve: measured?.sleeveLength};
  for (const key of ["shoulder", "torso", "sleeve"] as const) {
    if (now - runtime.lastMeasuredAt[key] > POSE_HOLD_MS) {
      runtime.body[key] = null;
      runtime.windows[key].length = 0;
    }
    const value = values[key];
    if (value != null && Number.isFinite(value)) {
      runtime.body[key] = ema(runtime.body[key], medianWindow(runtime.windows[key], value), emaAlpha);
      runtime.lastMeasuredAt[key] = now;
    }
  }
}
