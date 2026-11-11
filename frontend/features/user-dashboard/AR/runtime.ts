import * as THREE from "three";
import {addSceneLights, createEmptyRig} from "./lib/modelRig";
import type {ARRuntime, CalibrationSample} from "./types";

/**
 * Builds the shared mutable state for the AR loop. Created once per mount; the
 * hooks read and write it by reference, which keeps the render loop free of
 * React re-renders.
 */
export function createRuntime(
  calibrationFactor: {current: number},
  calibrationSample: {current: CalibrationSample},
): ARRuntime {
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(0, 1.2, 4.5);
  camera.lookAt(0, 1.2, 0);

  const scene = new THREE.Scene();
  addSceneLights(scene);

  return {
    scene,
    camera,
    clock: new THREE.Clock(),
    rig: createEmptyRig(),
    videoRect: null,
    lastVideoW: 0,
    lastVideoH: 0,
    targets: {
      scale: new THREE.Vector3(1, 1, 1),
      position: new THREE.Vector3(),
      yaw: 0,
      roll: 0,
      armZR: 0,
      elbowZR: 0,
      armZL: 0,
      elbowZL: 0,
      hasScale: false,
      hasPosition: false,
      hasArm: false,
    },
    applied: {yaw: 0, roll: 0, armZR: 0, elbowZR: 0, armZL: 0, elbowZL: 0},
    seeds: {scale: false, position: false, roll: false, arms: false, hadPose: false},
    body: {shoulder: null, torso: null, sleeve: null, size: null},
    windows: {shoulder: [], torso: [], sleeve: []},
    fit: {
      candidateKey: "",
      candidateSince: 0,
      acceptedKey: "",
      lastPickedSeen: undefined,
      lastSelectedCriterion: "",
      lastScaleKey: "",
    },
    refs: {
      pickedSize: {current: null},
      sizes: {current: undefined},
      sizeMeasurements: {current: undefined},
      category: {current: undefined},
      selectedCriterion: {current: "shoulder"},
      calibrationFactor,
      calibrationSample,
    },
    scratch: {
      anchorA: new THREE.Vector3(),
      anchorB: new THREE.Vector3(),
      anchorMid: new THREE.Vector3(),
      leftShoulderWorld: new THREE.Vector3(),
      rightShoulderWorld: new THREE.Vector3(),
      leftHipWorld: new THREE.Vector3(),
      rightHipWorld: new THREE.Vector3(),
      midPoint: new THREE.Vector3(),
    },
    updateVideoRect: () => {},
  };
}
