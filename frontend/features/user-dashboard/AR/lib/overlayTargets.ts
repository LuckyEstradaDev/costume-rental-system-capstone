import {
  ANCHOR_DEPTH,
  BASE_GARMENT_SIZE,
  ENABLE_IDLE_TEST,
  GARMENT_Y_OFFSET,
  HIP_VIS_MIN,
  LIMB_VIS_MIN,
  METERS_PER_MODEL_UNIT,
  SHOULDER_VIS_MIN,
  YAW_SIGN,
} from "../config";
import type {ARRuntime} from "../types";
import {landmarkToWorld} from "../utils/anchors";
import {measurementRenderFactor} from "./bodyFit";
import {limbAngles, solveArm} from "./poseMath";

type Landmark = {x: number; y: number; z: number; visibility?: number};

/**
 * Converts one frame of MediaPipe landmarks into the overlay targets: scale,
 * facing/tilt, arm bends and anchor position. The render loop eases toward
 * these, so this only needs to run at the (throttled) detection rate.
 */
export function updateOverlayTargets(
  runtime: ARRuntime,
  poses: Landmark[][],
  worldLandmarks: Landmark[],
  setStatus: (message: string) => void,
): void {
  const {rig, scratch, targets, body, seeds, refs} = runtime;

  for (const landmark of poses) {
    const leftShoulder = landmark[11];
    const rightShoulder = landmark[12];
    if (!leftShoulder || !rightShoulder) continue;

    // Low-confidence shoulders are too noisy to drive the overlay: keep the
    // last targets (the garment freezes) instead of chasing them.
    const shouldersVisible =
      (leftShoulder.visibility ?? 0) >= SHOULDER_VIS_MIN &&
      (rightShoulder.visibility ?? 0) >= SHOULDER_VIS_MIN;

    // Feed the calibrator: shoulder span as a frame fraction, the tracker's
    // metric shoulder estimate, and how front-facing the body is.
    refs.calibrationSample.current = {
      shoulderM: body.shoulder,
      shoulderFrac: Math.abs(leftShoulder.x - rightShoulder.x),
      cosYaw: Math.abs(Math.cos(runtime.applied.yaw)),
    };

    if (rig.shirt && shouldersVisible) {
      // A fresh acquisition re-seeds the eased values so the garment snaps onto
      // the body instead of swinging in from the previous tracking session.
      if (!seeds.hadPose) {
        seeds.hadPose = true;
        seeds.position = false;
        seeds.roll = false;
        seeds.arms = false;
      }

      landmarkToWorld(leftShoulder, runtime.camera, ANCHOR_DEPTH, runtime.videoRect, scratch.leftShoulderWorld);
      landmarkToWorld(rightShoulder, runtime.camera, ANCHOR_DEPTH, runtime.videoRect, scratch.rightShoulderWorld);

      const leftHip = landmark[23];
      const rightHip = landmark[24];
      const hipsVisible = Boolean(
        leftHip &&
          rightHip &&
          (leftHip.visibility ?? 0) >= HIP_VIS_MIN &&
          (rightHip.visibility ?? 0) >= HIP_VIS_MIN,
      );
      if (hipsVisible && leftHip && rightHip) {
        landmarkToWorld(leftHip, runtime.camera, ANCHOR_DEPTH, runtime.videoRect, scratch.leftHipWorld);
        landmarkToWorld(rightHip, runtime.camera, ANCHOR_DEPTH, runtime.videoRect, scratch.rightHipWorld);
      }

      scratch.midPoint.addVectors(scratch.leftShoulderWorld, scratch.rightShoulderWorld).multiplyScalar(0.5);

      // TARGET: scale. Map real metres onto screen world units so the garment
      // keeps its real dimensions instead of being resized to the body.
      const projectedShoulderWidth = scratch.leftShoulderWorld.distanceTo(scratch.rightShoulderWorld);

      if (projectedShoulderWidth > 0 && body.shoulder) {
        // Yaw foreshortens the shoulder line, so prefer a vertical shoulder-to-
        // hip span when the hips are visible; otherwise fold by cos(yaw).
        const cosYaw = Math.max(Math.abs(Math.cos(runtime.applied.yaw)), 0.35);
        let unitsPerMetre = projectedShoulderWidth / (body.shoulder * cosYaw);
        if (hipsVisible && body.torso) {
          const hipMid = scratch.anchorA
            .addVectors(scratch.leftHipWorld, scratch.rightHipWorld)
            .multiplyScalar(0.5);
          const projectedTorso = scratch.midPoint.distanceTo(hipMid);
          if (projectedTorso > 0.01) {
            unitsPerMetre = projectedTorso / body.torso;
          }
        }

        // Non-uniform scale from the outfit's real measurements: width from the
        // size's shoulder, length from outfitLength. Depth follows width.
        const sizeMap = refs.sizeMeasurements.current;
        const widthRatio = measurementRenderFactor(
          refs.pickedSize.current,
          BASE_GARMENT_SIZE,
          sizeMap,
          "shoulder",
          rig.metrics.shoulderMeasured ? rig.metrics.shoulderWidth : null,
        );
        const lengthRatio = measurementRenderFactor(
          refs.pickedSize.current,
          BASE_GARMENT_SIZE,
          sizeMap,
          "outfitLength",
          rig.metrics.heightMeasured ? rig.metrics.height : null,
        );

        const baseScale = unitsPerMetre * METERS_PER_MODEL_UNIT;
        const scaleKey = `${refs.pickedSize.current ?? "auto"}|${widthRatio.toFixed(3)}|${lengthRatio.toFixed(3)}`;
        if (scaleKey !== runtime.fit.lastScaleKey) {
          runtime.fit.lastScaleKey = scaleKey;
          console.debug("[scale]", scaleKey);
        }

        targets.scale.set(
          baseScale * widthRatio,
          baseScale * lengthRatio,
          baseScale * widthRatio,
        );
        targets.hasScale = true;
      }

      // TARGET: facing (yaw) + shoulder tilt (roll).
      if (rig.rootJoint && !ENABLE_IDLE_TEST) {
        const shoulderL = worldLandmarks[11];
        const shoulderR = worldLandmarks[12];
        if (shoulderL && shoulderR) {
          targets.yaw =
            YAW_SIGN *
            Math.atan2(-(shoulderR.z - shoulderL.z), -(shoulderR.x - shoulderL.x));

          // Measure tilt in 3D so it stays stable when the body is side-on.
          const dy = scratch.rightShoulderWorld.y - scratch.leftShoulderWorld.y;
          targets.roll =
            Math.sign(dy) *
            Math.atan2(
              Math.abs(shoulderR.y - shoulderL.y),
              Math.hypot(shoulderR.x - shoulderL.x, shoulderR.z - shoulderL.z),
            );
        }
      }

      // TARGET: arm bends (only when the model has an arm rig).
      if (rig.hasArmRig && rig.armRest && !ENABLE_IDLE_TEST) {
        const leftElbow = landmark[13];
        const leftWrist = landmark[15];
        const rightElbow = landmark[14];
        const rightWrist = landmark[16];

        const cosYaw = Math.cos(runtime.applied.yaw);
        const armRest = rig.armRest;

        // Hidden limbs would feed the solver garbage angles, so ease them back
        // to their rest pose instead.
        if (
          rightElbow &&
          rightWrist &&
          (rightElbow.visibility ?? 0) >= LIMB_VIS_MIN &&
          (rightWrist.visibility ?? 0) >= LIMB_VIS_MIN
        ) {
          const angles = limbAngles(rightShoulder, rightElbow, rightWrist);
          const solved = solveArm(armRest.right, angles.up, angles.fore, cosYaw);
          targets.armZR = solved.armZ;
          targets.elbowZR = solved.elbowZ;
        } else {
          targets.armZR = armRest.right.upLocalZ;
          targets.elbowZR = armRest.right.elbowLocalZ;
        }

        if (
          leftElbow &&
          leftWrist &&
          (leftElbow.visibility ?? 0) >= LIMB_VIS_MIN &&
          (leftWrist.visibility ?? 0) >= LIMB_VIS_MIN
        ) {
          const angles = limbAngles(leftShoulder, leftElbow, leftWrist);
          const solved = solveArm(armRest.left, angles.up, angles.fore, cosYaw);
          targets.armZL = solved.armZ;
          targets.elbowZL = solved.elbowZ;
        } else {
          targets.armZL = armRest.left.upLocalZ;
          targets.elbowZL = armRest.left.elbowLocalZ;
        }

        targets.hasArm = true;
      }

      // TARGET: anchor. Land the model's current shoulder line on the detected
      // one by measuring where it is after the last eased frame.
      rig.shirt.updateMatrixWorld(true);
      if (rig.leftShoulderBone && rig.rightShoulderBone) {
        rig.leftShoulderBone.getWorldPosition(scratch.anchorA);
        rig.rightShoulderBone.getWorldPosition(scratch.anchorB);
        scratch.anchorMid.addVectors(scratch.anchorA, scratch.anchorB).multiplyScalar(0.5);
        targets.position.copy(rig.shirt.position);
        targets.position.x += scratch.midPoint.x - scratch.anchorMid.x;
        targets.position.y += scratch.midPoint.y - scratch.anchorMid.y + GARMENT_Y_OFFSET;
        targets.position.z += scratch.midPoint.z - scratch.anchorMid.z;
      } else {
        targets.position.copy(scratch.midPoint);
      }
      targets.hasPosition = true;
    }

    setStatus("");
  }
}
