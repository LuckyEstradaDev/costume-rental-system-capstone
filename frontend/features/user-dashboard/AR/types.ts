import type * as THREE from "three";
import type {
  FitCriterionKey,
  FitCriterionTone,
  GarmentMeasurements,
} from "./lib/bodyFit";

/** Props the browse page passes to the AR try-on. */
export type ARProps = {
  modelUrl: string;
  sizes?: readonly string[];
  /** Real per-size garment measurements (inches), keyed by size label. */
  sizeMeasurements?: Record<string, GarmentMeasurements>;
  /** Outfit category; long-cut categories skip sleeve/length verdicts. */
  category?: string;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
};

/** Rest-pose reference for one arm, captured once after the rig loads. */
export type ArmCalibration = {
  /** screen-plane angle (rad) of the upper arm at rest */
  upAngle: number;
  /** +1 when the bone's local Z aligns with world Z, else -1 */
  upZSign: number;
  /** the bone's rest local Z rotation */
  upLocalZ: number;
  /** screen-plane angle (rad) of the forearm at rest */
  foreAngle: number;
  foreZSign: number;
  elbowLocalZ: number;
};

/** Model spans measured at load time (model units = metres). */
export type ModelMetrics = {
  shoulderWidth: number;
  shoulderMeasured: boolean;
  height: number;
  heightMeasured: boolean;
};

/** Bones and measurements resolved from a loaded garment. */
export type ARRig = {
  shirt: THREE.Object3D | null;
  rightArm: THREE.Bone | null;
  leftArm: THREE.Bone | null;
  rightElbow: THREE.Bone | null;
  leftElbow: THREE.Bone | null;
  rootJoint: THREE.Bone | null;
  leftShoulderBone: THREE.Object3D | null;
  rightShoulderBone: THREE.Object3D | null;
  hasArmRig: boolean;
  armRest: {right: ArmCalibration; left: ArmCalibration} | null;
  metrics: ModelMetrics;
};

/** Targets written by the pose tracker, eased toward by the render loop. */
export type ARTargets = {
  scale: THREE.Vector3;
  position: THREE.Vector3;
  yaw: number;
  roll: number;
  armZR: number;
  elbowZR: number;
  armZL: number;
  elbowZL: number;
  hasScale: boolean;
  hasPosition: boolean;
  hasArm: boolean;
};

/** Eased values the render loop applies to the model. */
export type ARApplied = {
  yaw: number;
  roll: number;
  armZR: number;
  elbowZR: number;
  armZL: number;
  elbowZL: number;
};

/** One-shot "snap instead of ease" flags, plus whether a pose was seen. */
export type ARSeeds = {
  scale: boolean;
  position: boolean;
  roll: boolean;
  arms: boolean;
  hadPose: boolean;
};

/** Smoothed body measurements (metres) and the last estimated size letter. */
export type ARBody = {
  shoulder: number | null;
  torso: number | null;
  sleeve: number | null;
  size: string | null;
};

/** Fit verdict debounce state. */
export type ARFitDebounce = {
  candidateKey: string;
  candidateSince: number;
  acceptedKey: string;
  lastPickedSeen: string | undefined | null;
  lastSelectedCriterion: string;
  lastScaleKey: string;
};

/** Shoulder span sampled while the calibration card is held up. */
export type CalibrationSample = {
  shoulderM: number | null;
  shoulderFrac: number | null;
  cosYaw: number;
};

/** Refs shared between hooks without triggering re-renders. */
export type ARRefs = {
  pickedSize: {current: string | null};
  sizes: {current: readonly string[] | undefined};
  sizeMeasurements: {current: Record<string, GarmentMeasurements> | undefined};
  category: {current: string | undefined};
  selectedCriterion: {current: FitCriterionKey};
  calibrationFactor: {current: number};
  calibrationSample: {current: CalibrationSample};
};

/** Reused vectors so the render/pose loops do not allocate every frame. */
export type ARScratch = {
  anchorA: THREE.Vector3;
  anchorB: THREE.Vector3;
  anchorMid: THREE.Vector3;
  leftShoulderWorld: THREE.Vector3;
  rightShoulderWorld: THREE.Vector3;
  leftHipWorld: THREE.Vector3;
  rightHipWorld: THREE.Vector3;
  midPoint: THREE.Vector3;
};

/** The camera video's on-screen rect (object-fit aware), in CSS px. */
export type ARVideoRect = {
  offsetX: number;
  offsetY: number;
  drawW: number;
  drawH: number;
  fit: "cover" | "contain";
  w: number;
  h: number;
};

/** Everything the AR loop needs, shared by reference between hooks. */
export type ARRuntime = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  clock: THREE.Clock;
  rig: ARRig;
  videoRect: ARVideoRect | null;
  lastVideoW: number;
  lastVideoH: number;
  targets: ARTargets;
  applied: ARApplied;
  seeds: ARSeeds;
  body: ARBody;
  windows: {
    shoulder: number[];
    torso: number[];
    sleeve: number[];
  };
  fit: ARFitDebounce;
  refs: ARRefs;
  scratch: ARScratch;
  updateVideoRect: () => void;
};

export type FitTone = FitCriterionTone;
export type FitChipState = {key: FitCriterionKey; label: string; tone: FitTone};
export type FitToastState = {text: string; tone: "red" | "amber"};
