import {ARM_YAW_EPS} from "../config";
import type {ArmCalibration} from "../types";
import {shortestAngle} from "../utils/math";

export type ScreenPoint = {x: number; y: number};

/**
 * Screen-plane angles of an arm's upper and forearm segments. The landmark ->
 * world mapping flips both axes, so the model-space direction is (-dx, -dy).
 */
export function limbAngles(shoulder: ScreenPoint, elbow: ScreenPoint, wrist: ScreenPoint) {
  return {
    up: Math.atan2(-(elbow.y - shoulder.y), -(elbow.x - shoulder.x)),
    fore: Math.atan2(-(wrist.y - elbow.y), -(wrist.x - elbow.x)),
  };
}

/**
 * Turns the limb's screen angles into local Z rotations, applied as a delta
 * from the captured rest pose. The solver divides out yaw foreshortening so the
 * same physical swing tracks through front, side and back.
 */
export function solveArm(
  rest: ArmCalibration,
  upTarget: number,
  foreTarget: number,
  cosYaw: number,
): {armZ: number; elbowZ: number} {
  // Apply the body's projection to the rest reference too; otherwise an arm
  // that is simply still reads as a big delta and flares when the body turns.
  const restUp = Math.atan2(Math.sin(rest.upAngle), Math.cos(rest.upAngle) * cosYaw);
  const restFore = Math.atan2(Math.sin(rest.foreAngle), Math.cos(rest.foreAngle) * cosYaw);

  // The same yaw factor drives both terms: the elbow is measured relative to
  // the upper arm, so applying it to only one would invert the forearm.
  const stretch = (cosYaw * (1 + ARM_YAW_EPS)) / (cosYaw * cosYaw + ARM_YAW_EPS);

  const dUp = shortestAngle(upTarget - restUp) * stretch;
  const armZ = rest.upLocalZ + rest.upZSign * dUp;
  const dForeWorld = shortestAngle(foreTarget - restFore) * stretch - dUp;
  const elbowZ = rest.elbowLocalZ + rest.foreZSign * dForeWorld;

  return {armZ, elbowZ};
}
