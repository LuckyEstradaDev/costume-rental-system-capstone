import {
  ANCHOR_DEPTH,
  GARMENT_Y_OFFSET,
  HIP_VIS_MIN,
  MAX_GARMENT_DISTANCE_M,
  MIN_GARMENT_DISTANCE_M,
  POSE_HOLD_MS,
  PROFILE_VIS_MIN,
  SHOULDER_VIS_MIN,
  YAW_SIGN,
} from "../config";
import type {ARRuntime} from "../types";
import {landmarkToWorld} from "../utils/anchors";
import {shortestAngle} from "../utils/math";
import {trackSleeve, type Landmark} from "./poseMath";
import {measureShoulders} from "./bodyFit";

export function updateOverlayTargets(
  runtime: ARRuntime,
  pose: Landmark[],
  worldLandmarks: Landmark[],
  now: number,
  setStatus: (message: string) => void,
): void {
  const {camera, videoRect, rig, scratch, targets, body, seeds, refs} = runtime;
  const left = visibleInFrame(pose[11], SHOULDER_VIS_MIN) ? pose[11] : null;
  const right = visibleInFrame(pose[12], SHOULDER_VIS_MIN) ? pose[12] : null;
  const visibleShoulder = left ?? right;
  const leftWorld = worldLandmarks[11];
  const rightWorld = worldLandmarks[12];
  const shoulderYaw = estimateYaw(leftWorld, rightWorld, SHOULDER_VIS_MIN);
  const hipYaw = estimateYaw(worldLandmarks[23], worldLandmarks[24], HIP_VIS_MIN);

  // Prefer the chest when the wearer twists at the waist. Hips can carry the turn at profile.
  let yaw = shoulderYaw ?? hipYaw;
  if (shoulderYaw !== null && hipYaw !== null) {
    const hipDelta = shortestAngle(hipYaw - shoulderYaw);
    if (Math.abs(hipDelta) < Math.PI / 4) yaw = shoulderYaw + hipDelta * 0.25;
  }
  if (yaw === null && targets.hasShoulderAnchor && visibleShoulder) {
    const profile = estimateYaw(leftWorld, rightWorld, PROFILE_VIS_MIN);
    if (profile !== null && Math.abs(Math.cos(profile)) < 0.5 &&
      Math.abs(shortestAngle(profile - targets.yaw)) < Math.PI / 4) {
      yaw = profile;
    }
  }
  // Swapped landmark labels can briefly make the garment appear to face backward.
  if (yaw !== null && targets.hasShoulderAnchor && Math.abs(shortestAngle(yaw - targets.yaw)) > Math.PI / 2) {
    yaw = null;
  }

  if (yaw !== null) {
    targets.yaw = yaw;
    targets.lastOrientationAt = now;
  }
  if (shoulderYaw !== null) {
    targets.roll = Math.atan2(leftWorld.y - rightWorld.y,
      Math.hypot(leftWorld.x - rightWorld.x, leftWorld.z - rightWorld.z));
  }

  const cosYaw = Math.abs(Math.cos(targets.yaw));
  refs.calibrationSample.current = {
    capturedAt: now,
    shoulderM: measureShoulders(worldLandmarks),
    shoulderFrac: left && right ? Math.abs(left.x - right.x) : null,
    cosYaw: shoulderYaw === null ? 0 : Math.abs(Math.cos(shoulderYaw)),
  };

  if (targets.lastOrientationAt === null || now - targets.lastOrientationAt > POSE_HOLD_MS) {
    targets.hasShoulderAnchor = false;
  } else if (left && right) {
    landmarkToWorld(left, camera, ANCHOR_DEPTH, videoRect, scratch.leftShoulderWorld);
    landmarkToWorld(right, camera, ANCHOR_DEPTH, videoRect, scratch.rightShoulderWorld);
    const distance = estimateDistance(runtime, pose, cosYaw);
    targets.shoulderAnchor.addVectors(scratch.leftShoulderWorld, scratch.rightShoulderWorld)
      .multiplyScalar(0.5);
    placeAtDistance(runtime, distance);
    targets.lastAnchorAt = now;
    targets.hasShoulderAnchor = true;
  } else if (visibleShoulder && body.shoulder && targets.hasShoulderAnchor) {
    // Recover the center from the visible joint using the wearer's span and last reliable depth.
    const halfSpan = body.shoulder * refs.calibrationFactor.current * (left ? -0.5 : 0.5);
    const horizontalSpan = halfSpan * Math.cos(targets.roll);
    scratch.shoulderOffset.set(
      horizontalSpan * Math.cos(targets.yaw),
      halfSpan * Math.sin(targets.roll),
      horizontalSpan * Math.sin(targets.yaw * YAW_SIGN),
    );
    const distance = camera.position.z - targets.shoulderAnchor.z;
    landmarkToWorld(visibleShoulder, camera, ANCHOR_DEPTH, videoRect, targets.shoulderAnchor);
    placeAtDistance(runtime, distance - scratch.shoulderOffset.z);
    targets.shoulderAnchor.sub(scratch.shoulderOffset);
    targets.lastAnchorAt = now;
  } else if (targets.lastAnchorAt === null || now - targets.lastAnchorAt > POSE_HOLD_MS) {
    targets.hasShoulderAnchor = false;
  }

  if (!targets.hasShoulderAnchor) {
    seeds.position = false;
    seeds.orientation = false;
    seeds.arms = false;
    targets.leftSleeve.tracked = false;
    targets.rightSleeve.tracked = false;
    setStatus(pose.length ? "Keep your upper body in view." : "Waiting for pose...");
    return;
  }

  if (rig.sleeves) {
    trackSleeve(targets.leftSleeve, leftWorld, worldLandmarks[13], worldLandmarks[15], refs.calibrationFactor.current);
    trackSleeve(targets.rightSleeve, rightWorld, worldLandmarks[14], worldLandmarks[16], refs.calibrationFactor.current);
  }
  setStatus("");
}

function isVisible(landmark: Landmark | undefined, minimum: number): landmark is Landmark {
  return Boolean(landmark && (landmark.visibility ?? 0) >= minimum);
}

function visibleInFrame(landmark: Landmark | undefined, minimum: number): landmark is Landmark {
  return isVisible(landmark, minimum) && landmark.x >= 0 && landmark.x <= 1 &&
    landmark.y >= 0 && landmark.y <= 1;
}

function estimateYaw(left: Landmark | undefined, right: Landmark | undefined, minimum: number): number | null {
  if (!isVisible(left, minimum) || !isVisible(right, minimum)) return null;
  const dx = left.x - right.x;
  const dz = left.z - right.z;
  // A collapsed axis gives an unstable direction when one joint is hidden.
  return Math.hypot(dx, dz) >= 0.1 ? YAW_SIGN * Math.atan2(dz, dx) : null;
}

function placeAtDistance({camera, targets}: ARRuntime, distance: number): void {
  const referenceDistance = camera.position.z - ANCHOR_DEPTH;
  targets.shoulderAnchor.sub(camera.position).multiplyScalar(distance / referenceDistance).add(camera.position);
  targets.shoulderAnchor.y += GARMENT_Y_OFFSET;
}

function estimateDistance(runtime: ARRuntime, pose: Landmark[], cosYaw: number): number {
  const {camera, videoRect, scratch, body, refs, targets} = runtime;
  const referenceDistance = camera.position.z - ANCHOR_DEPTH;
  let projectedSpan = scratch.leftShoulderWorld.distanceTo(scratch.rightShoulderWorld);
  let measuredSpan = body.shoulder && cosYaw >= 0.35 ? body.shoulder * cosYaw : 0;

  const leftHip = pose[23];
  const rightHip = pose[24];
  if (body.torso && visibleInFrame(leftHip, HIP_VIS_MIN) && visibleInFrame(rightHip, HIP_VIS_MIN)) {
    landmarkToWorld(leftHip, camera, ANCHOR_DEPTH, videoRect, scratch.leftHipWorld);
    landmarkToWorld(rightHip, camera, ANCHOR_DEPTH, videoRect, scratch.rightHipWorld);
    const shoulderMid = scratch.anchorA.addVectors(scratch.leftShoulderWorld, scratch.rightShoulderWorld).multiplyScalar(0.5);
    const hipMid = scratch.anchorB.addVectors(scratch.leftHipWorld, scratch.rightHipWorld).multiplyScalar(0.5);
    const torsoSpan = shoulderMid.distanceTo(hipMid);
    if (torsoSpan > 0.01) {
      projectedSpan = torsoSpan;
      measuredSpan = body.torso;
    }
  }

  const distance = referenceDistance * measuredSpan * refs.calibrationFactor.current / projectedSpan;
  if (!Number.isFinite(distance) || distance <= 0) {
    return targets.hasShoulderAnchor ? camera.position.z - targets.shoulderAnchor.z : referenceDistance;
  }
  return Math.min(MAX_GARMENT_DISTANCE_M, Math.max(MIN_GARMENT_DISTANCE_M, distance));
}
