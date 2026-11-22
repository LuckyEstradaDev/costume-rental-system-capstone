import {Quaternion, Vector3, type Bone} from "three";
import {LIMB_VIS_MIN} from "../config";
import type {SleeveBone, SleeveRig, SleeveTarget} from "../types";

export type Landmark = {x: number; y: number; z: number; visibility?: number};

export function captureSleeveRig(arm: Bone, forearm: Bone): SleeveRig {
  // The upper-arm axis runs from the shoulder to the elbow. Blender bones point along local Y.
  const armAxis = arm.worldToLocal(forearm.getWorldPosition(new Vector3())).normalize();
  return {
    upperArm: captureRestPose(arm, armAxis),
    forearm: captureRestPose(forearm, new Vector3(0, 1, 0)),
    elbowFolds: [],
  };
}

function captureRestPose(bone: Bone, axis: Vector3): SleeveBone {
  const restRotation = bone.quaternion.clone();
  return {bone, restRotation, restDirection: axis.applyQuaternion(restRotation)};
}

export function trackSleeve(
  target: SleeveTarget,
  shoulder: Landmark | undefined,
  elbow: Landmark | undefined,
  wrist: Landmark | undefined,
): void {
  if (
    !shoulder || !elbow || !wrist ||
    (shoulder.visibility ?? 0) < LIMB_VIS_MIN ||
    (elbow.visibility ?? 0) < LIMB_VIS_MIN ||
    (wrist.visibility ?? 0) < LIMB_VIS_MIN
  ) return;

  // Mirrored video flips X; Three.js uses up and toward the camera for +Y and +Z.
  const upperX = shoulder.x - elbow.x;
  const upperY = shoulder.y - elbow.y;
  const upperZ = shoulder.z - elbow.z;
  const forearmX = elbow.x - wrist.x;
  const forearmY = elbow.y - wrist.y;
  const forearmZ = elbow.z - wrist.z;

  if (
    !(Math.hypot(upperX, upperY, upperZ) > 0.01) ||
    !(Math.hypot(forearmX, forearmY, forearmZ) > 0.01)
  ) return;

  target.upperArm.set(upperX, upperY, upperZ).normalize();
  target.forearm.set(forearmX, forearmY, forearmZ).normalize();
  target.tracked = true;
}

export function createSleevePoseScratch() {
  return {parentRotation: new Quaternion(), rotation: new Quaternion(), direction: new Vector3()};
}

export function poseSleeve(
  sleeve: SleeveRig,
  target: SleeveTarget,
  weight: number,
  scratch: ReturnType<typeof createSleevePoseScratch>,
): void {
  if (!target.tracked) return;

  aimBone(sleeve.upperArm, target.upperArm, weight, scratch);
  aimBone(sleeve.forearm, target.forearm, weight, scratch);
  // Straight arms relax the cloth. A right-angle bend fully gathers the sleeve.
  const fold = Math.min(1, Math.max(0, 1 - target.upperArm.dot(target.forearm)));
  for (const {weights, index} of sleeve.elbowFolds) {
    weights[index] += (fold - weights[index]) * weight;
  }
}

function aimBone(
  sleeveBone: SleeveBone,
  worldDirection: Vector3,
  weight: number,
  {parentRotation, rotation, direction}: ReturnType<typeof createSleevePoseScratch>,
): void {
  const {bone, restDirection, restRotation} = sleeveBone;
  if (!bone.parent || restDirection.lengthSq() === 0) return;

  // Convert to parent space, then rotate from the authored direction toward the tracked one.
  bone.parent.getWorldQuaternion(parentRotation).invert();
  direction.copy(worldDirection).applyQuaternion(parentRotation).normalize();
  rotation.setFromUnitVectors(restDirection, direction).multiply(restRotation);
  bone.quaternion.slerp(rotation, weight);
}
