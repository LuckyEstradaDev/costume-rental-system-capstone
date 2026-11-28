import type {NormalizedLandmark} from "@mediapipe/tasks-vision";
import {adjustedSleeveIn, bideltoidFromJoint, M_TO_IN, type BodyMeasurements} from "./bodyFit";
import {MIN_STABLE_SAMPLES, stableMedian} from "./calibration";
import {POSE_HOLD_MS, SHOULDER_VIS_MIN} from "../config";

const HOLD_STILL_MS = 1000;
const TRACKED_JOINTS = [11, 12, 23, 24, 13, 14, 15, 16];

type JointPosition = {index: number; x: number; y: number};
type Sample = {
  at: number;
  joints: JointPosition[];
  shoulder: number;
  torso: number;
  sleeve: number;
};

export type CapturedMeasurements = {
  body: BodyMeasurements;
  shoulderIn: number;
  torsoIn: number;
  sleeveIn: number;
};
export type AcceptedCapture = {values: CapturedMeasurements; waistInches: number | null};
export type MeasurementRequest = {
  samples: Sample[];
  complete: (values: CapturedMeasurements) => void;
};

function visibleJoints(pose: NormalizedLandmark[], aspect: number): JointPosition[] {
  const joints: JointPosition[] = [];
  for (const index of TRACKED_JOINTS) {
    const p = pose[index];
    if (p && p.visibility >= SHOULDER_VIS_MIN && p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1) {
      joints.push({index, x: p.x * aspect, y: p.y});
    }
  }
  return joints;
}

function heldPose(first: JointPosition[], current: JointPosition[]): boolean {
  if (first.length !== current.length) return false;
  const [left, right] = first;
  const tolerance = Math.hypot(left.x - right.x, left.y - right.y) * 0.07;
  return first.every((p, i) => p.index === current[i].index &&
    Math.hypot(p.x - current[i].x, p.y - current[i].y) <= tolerance);
}

/** Use fresh pose frames so a moving person cannot pass just because their limb lengths stay constant. */
export function captureSteadyValues(
  samples: Sample[], body: BodyMeasurements | null, pose: NormalizedLandmark[],
  aspect: number, at: number, cardShoulderM: number | null,
): CapturedMeasurements | null {
  if (cardShoulderM === null || !body || body.torsoLength === null || body.sleeveLength === null) {
    samples.length = 0;
    return null;
  }

  const joints = visibleJoints(pose, aspect);
  // Shoulders and hips are the first four entries when all are visible.
  if (joints[0]?.index !== 11 || joints[3]?.index !== 24) {
    samples.length = 0;
    return null;
  }
  const last = samples.at(-1);
  if (last && at <= last.at) return null;
  if (last && (at - last.at > POSE_HOLD_MS || !heldPose(samples[0].joints, joints))) samples.length = 0;
  samples.push({at, joints, shoulder: body.shoulderWidth, torso: body.torsoLength, sleeve: body.sleeveLength});
  if (samples.length < MIN_STABLE_SAMPLES || at - samples[0].at < HOLD_STILL_MS) return null;

  const shoulder = stableMedian(samples.map((s) => s.shoulder));
  const torso = stableMedian(samples.map((s) => s.torso));
  const sleeve = stableMedian(samples.map((s) => s.sleeve));
  if (shoulder === null || torso === null || sleeve === null) {
    samples.shift();
    return null;
  }
  // Anchor the steady pose to the width measured against this wearer's card.
  const scale = cardShoulderM / shoulder;
  return {
    body: {shoulderWidth: cardShoulderM, torsoLength: torso * scale, sleeveLength: sleeve * scale},
    shoulderIn: bideltoidFromJoint(cardShoulderM),
    torsoIn: torso * scale * M_TO_IN,
    sleeveIn: adjustedSleeveIn(sleeve * scale),
  };
}
