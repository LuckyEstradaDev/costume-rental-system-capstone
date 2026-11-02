import {FIT_CONFIRM_MS, FIT_CONFIRM_OK_MS} from "../config";
import type {ARRuntime, FitChipState, FitToastState} from "../types";
import {
  bideltoidFromJoint,
  ema,
  evaluateFit,
  fitChipLabel,
  medianWindow,
  sizeFromShoulderWidth,
  type BodyMeasurements,
} from "./bodyFit";

/** Feeds one frame of measurements through a median pre-filter then the EMA. */
export function smoothBody(
  runtime: ARRuntime,
  measured: BodyMeasurements,
  emaAlpha: number,
): void {
  const {body, windows} = runtime;
  body.shoulder = ema(
    body.shoulder,
    medianWindow(windows.shoulder, measured.shoulderWidth),
    emaAlpha,
  );
  if (measured.torsoLength !== null) {
    body.torso = ema(body.torso, medianWindow(windows.torso, measured.torsoLength), emaAlpha);
  }
  if (measured.hipWidth !== null) {
    body.hip = ema(body.hip, medianWindow(windows.hip, measured.hipWidth), emaAlpha);
  }
}

/**
 * Turns smoothed measurements into the chip + toast. A verdict only lands after
 * it has been stable for a moment, so nothing flickers — except when the user
 * picks a size, which is judged immediately.
 */
export function publishFit(
  runtime: ARRuntime,
  setFitChip: (state: FitChipState | null) => void,
  setFitToast: (state: FitToastState | null) => void,
): void {
  const {body, fit: debounce, refs} = runtime;

  const measurements: BodyMeasurements | null =
    body.shoulder !== null
      ? {shoulderWidth: body.shoulder, torsoLength: body.torso, hipWidth: body.hip}
      : null;

  // Calibration rescales the tracker's estimate; the garment keeps raw tracking.
  const k = refs.calibrationFactor.current;
  const calibrated =
    measurements && k !== 1
      ? {
          shoulderWidth: measurements.shoulderWidth * k,
          torsoLength: measurements.torsoLength === null ? null : measurements.torsoLength * k,
          hipWidth: measurements.hipWidth === null ? null : measurements.hipWidth * k,
        }
      : measurements;

  const picked = refs.pickedSize.current;
  const fit = evaluateFit(calibrated, body.size, picked, refs.sizes.current, refs.sizeMeasurements.current);

  // Keep the measured size: it feeds the size deadband and garment scaling.
  if (calibrated && calibrated.shoulderWidth > 0) {
    body.size = sizeFromShoulderWidth(bideltoidFromJoint(calibrated.shoulderWidth), body.size);
  }

  const pickedChanged = debounce.lastPickedSeen !== undefined && picked !== debounce.lastPickedSeen;
  debounce.lastPickedSeen = picked;

  // The calibration factor is part of the key so the chip refreshes when it changes.
  const key = `${fit.kind}|${fit.size ?? ""}|${picked ?? "auto"}|${k}`;
  const now = performance.now();

  if (key !== debounce.candidateKey) {
    debounce.candidateKey = key;
    debounce.candidateSince = pickedChanged ? 0 : now;
  }

  const settleMs =
    fit.kind === "fits" || fit.kind === "unknown" ? FIT_CONFIRM_OK_MS : FIT_CONFIRM_MS;
  if (now - debounce.candidateSince < settleMs || key === debounce.acceptedKey) return;

  debounce.acceptedKey = key;
  console.debug("[fit]", key, calibrated);

  const label = fitChipLabel(fit);
  setFitChip(label && fit.tone ? {label, tone: fit.tone} : null);
  setFitToast(
    fit.toast && fit.tone !== "green"
      ? {text: fit.toast, tone: fit.tone === "red" ? "red" : "amber"}
      : null,
  );
}
