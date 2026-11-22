import * as THREE from "three";
import type {ARRig} from "../types";
import {captureSleeveRig} from "./poseMath";

/** A rig with every bone unresolved, used before the model loads. */
export function createEmptyRig(): ARRig {
  return {
    shirt: null,
    boneDebug: null,
    viewMaterials: [],
    rightArm: null,
    leftArm: null,
    rightElbow: null,
    leftElbow: null,
    rootJoint: null,
    leftShoulderBone: null,
    rightShoulderBone: null,
    sleeves: null,
  };
}

/**
 * Resolves the bones a garment rig exposes. Bone names are normalised
 * because three.js strips reserved characters
 * ('.', '/', ':', '[]') from glTF node names, so "arm.l" arrives as "arml".
 * Static meshes simply end up with no bones and are rendered as an overlay.
 */
export function bindModelRig(root: THREE.Object3D, modelUrl: string): ARRig {
  const rig = createEmptyRig();
  rig.shirt = root;

  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) {
        const side = material.userData.arSide === 1 ? 1 : material.userData.arSide === -1 ? -1 : 0;
        const rearCollar = material.userData.arRearCollar === true || material.name === "BarongRearCollar";
        if ((!side && !rearCollar) || rig.viewMaterials.some((entry) => entry.material === material)) continue;
        rig.viewMaterials.push({material, side, rearCollar, baseOpacity: material.opacity});
        material.transparent = true;
        material.visible = !rearCollar;
      }
    }
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

  if (rig.rightArm && rig.rightElbow && rig.leftArm && rig.leftElbow) {
    rig.sleeves = {
      right: captureSleeveRig(rig.rightArm, rig.rightElbow),
      left: captureSleeveRig(rig.leftArm, rig.leftElbow),
    };
    const sleeves = rig.sleeves;
    root.traverse((mesh) => {
      if (!(mesh instanceof THREE.Mesh) || !mesh.morphTargetInfluences) return;
      const weights = mesh.morphTargetInfluences;
      const left = mesh.morphTargetDictionary?.ElbowFoldLeft;
      const right = mesh.morphTargetDictionary?.ElbowFoldRight;
      if (left !== undefined) sleeves.left.elbowFolds.push({weights, index: left});
      if (right !== undefined) sleeves.right.elbowFolds.push({weights, index: right});
    });
  }

  if (!rig.rootJoint && !rig.sleeves) {
    console.warn(`"${modelUrl}" has no compatible rig; using a static overlay.`);
  }

  return rig;
}

/** Positive yaw turns the model's positive X side away from the camera. */
export function updateGarmentVisibility(materials: ARRig["viewMaterials"], yaw: number): void {
  if (!materials.length) return;
  const turn = Math.sin(yaw);
  const facing = Math.abs(Math.atan2(Math.sin(yaw), Math.cos(yaw)));
  const collarOpacity = THREE.MathUtils.smoothstep(facing, Math.PI / 4, Math.PI / 2);
  for (const {material, side, rearCollar, baseOpacity} of materials) {
    // Fade the far side from 45° to 75°, then restore it on the way to the back.
    const sideOpacity = 1 - THREE.MathUtils.smoothstep(side * turn, Math.SQRT1_2, Math.sin(75 * Math.PI / 180));
    const opacity = baseOpacity * sideOpacity * (rearCollar ? collarOpacity : 1);
    material.visible = opacity > 0;
    material.opacity = opacity;
  }
}

/** Adds the lights the garment is rendered under. */
export function addSceneLights(scene: THREE.Scene): void {
  scene.add(new THREE.AmbientLight(0xffffff, 2));
  const dir = new THREE.DirectionalLight(0xffffff, 2);
  dir.position.set(5, 5, 5);
  scene.add(dir);
}
