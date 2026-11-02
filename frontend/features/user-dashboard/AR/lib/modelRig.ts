import * as THREE from "three";
import {FALLBACK_MODEL_SHOULDER, SHOULDER_WIDEN} from "../config";
import type {ArmCalibration, ARRig} from "../types";

/** A rig with every bone unresolved, used before the model loads. */
export function createEmptyRig(): ARRig {
  return {
    shirt: null,
    rightArm: null,
    leftArm: null,
    rightElbow: null,
    leftElbow: null,
    rootJoint: null,
    leftShoulderBone: null,
    rightShoulderBone: null,
    hasArmRig: false,
    armRest: null,
    metrics: {shoulderWidth: 0, shoulderMeasured: false, height: 0, heightMeasured: false},
  };
}

/**
 * Captures one arm's rest pose so per-frame posing is applied as a delta from
 * how the rig was modelled, instead of assuming the arms start laid out flat.
 */
function measureArmRest(arm: THREE.Bone, elbow: THREE.Bone): ArmCalibration {
  const shoulderPos = new THREE.Vector3();
  const elbowPos = new THREE.Vector3();
  arm.getWorldPosition(shoulderPos);
  elbow.getWorldPosition(elbowPos);

  const upAngle = Math.atan2(elbowPos.y - shoulderPos.y, elbowPos.x - shoulderPos.x);

  const q = new THREE.Quaternion();
  arm.getWorldQuaternion(q);
  const upZSign = new THREE.Vector3(0, 0, 1).applyQuaternion(q).z >= 0 ? 1 : -1;

  elbow.getWorldQuaternion(q);
  const fore = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
  const foreAngle = Math.atan2(fore.y, fore.x);
  const foreZSign = new THREE.Vector3(0, 0, 1).applyQuaternion(q).z >= 0 ? 1 : -1;

  return {upAngle, upZSign, upLocalZ: arm.rotation.z, foreAngle, foreZSign, elbowLocalZ: elbow.rotation.z};
}

/**
 * Resolves the bones a garment rig exposes and measures its shoulder span and
 * height. Bone names are normalised because three.js strips reserved characters
 * ('.', '/', ':', '[]') from glTF node names, so "arm.l" arrives as "arml".
 * Static meshes simply end up with no bones and are rendered as an overlay.
 */
export function bindModelRig(root: THREE.Object3D, modelUrl: string): ARRig {
  const rig = createEmptyRig();
  rig.shirt = root;

  root.traverse((child) => {
    if (!(child instanceof THREE.Bone)) return;
    const key = child.name.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (!rig.rightArm && (key === "arml" || key.startsWith("upperarml"))) rig.rightArm = child;
    if (!rig.leftArm && (key === "armr" || key.startsWith("upperarmr"))) rig.leftArm = child;
    if (!rig.rightElbow && (key === "forearml" || key.startsWith("lowerarml"))) {
      rig.rightElbow = child;
    }
    if (!rig.leftElbow && (key === "forearmr" || key.startsWith("lowerarmr"))) {
      rig.leftElbow = child;
    }
    if (!rig.rightShoulderBone && key === "shoulderl") rig.rightShoulderBone = child;
    if (!rig.leftShoulderBone && key === "shoulderr") rig.leftShoulderBone = child;
    if (
      !rig.rootJoint &&
      (key.includes("rootjoint") || key.endsWith("spine3") || key === "neutralbone")
    ) {
      rig.rootJoint = child;
    }
  });

  // Rigs without dedicated shoulder bones fall back to the upper-arm joints.
  if (!rig.rightShoulderBone) rig.rightShoulderBone = rig.rightArm;
  if (!rig.leftShoulderBone) rig.leftShoulderBone = rig.leftArm;

  rig.hasArmRig = Boolean(rig.rightArm && rig.rightElbow && rig.leftArm && rig.leftElbow);

  console.log("[bones] resolved", {
    rightArm: rig.rightArm?.name,
    leftArm: rig.leftArm?.name,
    rightElbow: rig.rightElbow?.name,
    leftElbow: rig.leftElbow?.name,
    rightShoulderBone: rig.rightShoulderBone?.name,
    leftShoulderBone: rig.leftShoulderBone?.name,
    rootJoint: rig.rootJoint?.name,
    hasArmRig: rig.hasArmRig,
  });

  if (!rig.rootJoint && !rig.hasArmRig) {
    console.warn(
      `"${modelUrl}" has no skeleton - rendering it as a static overlay. ` +
        "Re-export with an armature/skin to enable pose-driven rigging.",
    );
  }

  // Shoulder width is applied once here; the fit maths owns the width afterwards.
  if (rig.rootJoint) rig.rootJoint.scale.x = SHOULDER_WIDEN;

  root.updateMatrixWorld(true);

  if (rig.leftShoulderBone && rig.rightShoulderBone) {
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    rig.leftShoulderBone.getWorldPosition(a);
    rig.rightShoulderBone.getWorldPosition(b);
    const width = a.distanceTo(b);
    if (width > 0.02 && width < 5) {
      rig.metrics.shoulderWidth = width;
      rig.metrics.shoulderMeasured = true;
    }
  }
  if (!rig.metrics.shoulderWidth) {
    console.warn("Could not measure model shoulders, using fallback width", FALLBACK_MODEL_SHOULDER);
    rig.metrics.shoulderWidth = FALLBACK_MODEL_SHOULDER;
  }

  const bbox = new THREE.Box3().setFromObject(root);
  const height = bbox.max.y - bbox.min.y;
  if (height > 0.2 && height < 2.5) {
    rig.metrics.height = height;
    rig.metrics.heightMeasured = true;
  }

  console.log(
    "[model] shoulder span / height (model units / metres):",
    rig.metrics.shoulderWidth.toFixed(3),
    height.toFixed(3),
  );

  if (rig.hasArmRig && rig.rightArm && rig.leftArm && rig.rightElbow && rig.leftElbow) {
    rig.armRest = {
      right: measureArmRest(rig.rightArm, rig.rightElbow),
      left: measureArmRest(rig.leftArm, rig.leftElbow),
    };
    console.log("[arms] rest calibration", rig.armRest);
  }

  return rig;
}

/** Adds the lights the garment is rendered under. */
export function addSceneLights(scene: THREE.Scene): void {
  scene.add(new THREE.AmbientLight(0xffffff, 2));
  const dir = new THREE.DirectionalLight(0xffffff, 2);
  dir.position.set(5, 5, 5);
  scene.add(dir);
}
