import {FIT_CONFIRM_MS, FIT_CONFIRM_OK_MS} from "../config";
import type {ARRuntime, FitChipState, FitToastState} from "../types";
import {
  bideltoidFromJoint,
  ema,
  evaluateFit,
  medianWindow,
  sizeFromShoulderWidth,
  type BodyMeasurements,
  type FitCriterion,
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
  if (measured.sleeveLength !== null) {
    body.sleeve = ema(body.sleeve, medianWindow(windows.sleeve, measured.sleeveLength), emaAlpha);
  }
}

/** Picks the most important warning for the dismissible toast. */
function toastFor(criteria: FitCriterion[]): FitToastState | null {
  const warning =
    criteria.find((criterion) => criterion.tone === "red" && criterion.detail) ??
    criteria.find((criterion) => criterion.tone === "amber" && criterion.detail);
  if (!warning?.detail) return null;
  return {text: warning.detail, tone: warning.tone === "red" ? "red" : "amber"};
}

/**
 * Turns smoothed measurements into the criterion chips + toast. A verdict only
 * lands after it has been stable for a moment, so nothing flickers — except when
 * the user picks a size, which is judged immediately.
 */
export function publishFit(
  runtime: ARRuntime,
  setFitChips: (state: FitChipState[] | null) => void,
  setFitToast: (state: FitToastState | null) => void,
): void {
  const {body, fit: debounce, refs} = runtime;

  const measurements: BodyMeasurements | null =
    body.shoulder !== null
      ? {
          shoulderWidth: body.shoulder,
          torsoLength: body.torso,
          sleeveLength: body.sleeve,
        }
      : null;

  // Calibration rescales the tracker's estimate; the garment keeps raw tracking.
  const k = refs.calibrationFactor.current;
  const calibrated =
    measurements && k !== 1
      ? {
          shoulderWidth: measurements.shoulderWidth * k,
          torsoLength: measurements.torsoLength === null ? null : measurements.torsoLength * k,
          sleeveLength: measurements.sleeveLength === null ? null : measurements.sleeveLength * k,
        }
      : measurements;

  const picked = refs.pickedSize.current;
  const fit = evaluateFit(
    calibrated,
    body.size,
    picked,
    refs.sizes.current,
    refs.sizeMeasurements.current,
    refs.category.current,
  );

  // Keep the measured size: it feeds the size deadband and garment scaling.
  if (calibrated && calibrated.shoulderWidth > 0) {
    body.size = sizeFromShoulderWidth(bideltoidFromJoint(calibrated.shoulderWidth), body.size);
  }

  const selectedCriterion = refs.selectedCriterion.current;
  const warningCriterion =
    fit.criteria.find((criterion) => criterion.key === selectedCriterion) ?? null;

  const pickedChanged = debounce.lastPickedSeen !== undefined && picked !== debounce.lastPickedSeen;
  debounce.lastPickedSeen = picked;
  const selectedChanged = debounce.lastSelectedCriterion !== selectedCriterion;
  debounce.lastSelectedCriterion = selectedCriterion;

  // The calibration factor is part of the key so the chips refresh when it changes.
  const criteriaKey = fit.criteria
    .map((criterion) => `${criterion.key}:${criterion.kind}:${criterion.estimated}`)
    .join("|");
  const key = `${selectedCriterion}|${criteriaKey}|${fit.size ?? ""}|${picked ?? "auto"}|${k}`;
  const now = performance.now();

  if (key !== debounce.candidateKey) {
    debounce.candidateKey = key;
    debounce.candidateSince = pickedChanged || selectedChanged ? 0 : now;
  }

  const hasWarning = fit.criteria.some(
    (criterion) => criterion.tone === "red" || criterion.tone === "amber",
  );
  const settleMs = hasWarning ? FIT_CONFIRM_MS : FIT_CONFIRM_OK_MS;
  if (now - debounce.candidateSince < settleMs || key === debounce.acceptedKey) return;

  debounce.acceptedKey = key;
  console.debug("[fit]", key, calibrated);

  const chips: FitChipState[] = fit.criteria.map(({key: criterionKey, label, tone}) => ({
    key: criterionKey,
    label,
    tone,
  }));
  setFitChips(chips.length > 0 ? chips : null);
  setFitToast(warningCriterion ? toastFor([warningCriterion]) : null);
}
