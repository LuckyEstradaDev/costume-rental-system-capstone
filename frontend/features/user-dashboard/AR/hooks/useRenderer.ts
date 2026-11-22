/* eslint-disable react-hooks/immutability */
import {useEffect} from "react";
import type {RefObject} from "react";
import * as THREE from "three";
import {
  ARM_TAU_MS,
  ENABLE_IDLE_TEST,
  POSITION_TAU_MS,
  ROLL_TAU_MS,
  SHOW_GARMENT,
  YAW_TAU_MS,
} from "../config";
import {computeVideoFit} from "../lib/objectFit";
import {updateGarmentVisibility} from "../lib/modelRig";
import {createSleevePoseScratch, poseSleeve} from "../lib/poseMath";
import type {ARRuntime} from "../types";
import {shortestAngle, smoothAlpha} from "../utils/math";
import type {WebcamHandle} from "../components/WebCam";

/**
 * Owns the Three.js scene, renderer, resize/DPR handling and the render loop.
 * The loop only eases toward the targets the pose tracker writes, so it can run
 * at display refresh rate independently of the (throttled) inference.
 */
export function useRenderer(
  runtime: ARRuntime,
  containerRef: RefObject<HTMLDivElement | null>,
  webcamRef: RefObject<WebcamHandle | null>,
): void {
  useEffect(() => {
    const container = containerRef.current;
    const {scene, camera, clock} = runtime;
    const sleeveScratch = createSleevePoseScratch();

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      powerPreference: "high-performance",
    });

    // Recompute the video's on-screen rect (object-fit aware) and keep the
    // video element's CSS fit in lockstep with the landmark mapping.
    const updateVideoRect = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const video = webcamRef.current?.video;
      const vw = video?.videoWidth ?? 0;
      const vh = video?.videoHeight ?? 0;
      const fit = computeVideoFit(w, h, vw, vh);
      if (!fit) {
        runtime.videoRect = null;
        return;
      }
      runtime.videoRect = {...fit, w, h};
      if (video) video.style.objectFit = fit.fit;
    };
    runtime.updateVideoRect = updateVideoRect;

    const resize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      updateVideoRect();
      // Snap (rather than ease) the garment onto the new framing.
      runtime.seeds.position = false;
    };

    // The canvas is a replaced element: without an explicit CSS box it keeps
    // its drawing-buffer size, so at devicePixelRatio != 1 the overlay drifts
    // from the webcam. Pin its CSS box to the container (the buffer stays
    // w*dpr for sharpness).
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.zIndex = "25";
    renderer.domElement.style.pointerEvents = "none";
    container?.appendChild(renderer.domElement);

    resize();

    const resizeObserver = new ResizeObserver(resize);
    if (container) resizeObserver.observe(container);
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    window.visualViewport?.addEventListener("resize", resize);

    // A pixel-ratio change (monitor switch, browser zoom) may not fire a resize.
    let dprMedia: MediaQueryList | null = null;
    const handleDprChange = () => {
      resize();
      watchDpr();
    };
    function watchDpr() {
      dprMedia?.removeEventListener("change", handleDprChange);
      dprMedia = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      dprMedia.addEventListener("change", handleDprChange);
    }
    watchDpr();

    renderer.render(scene, camera);

    let animationFrameId = 0;
    let lastFrameAt = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = lastFrameAt ? now - lastFrameAt : 1000 / 60;
      lastFrameAt = now;

      const {rig, targets, applied, seeds, scratch} = runtime;
      const shirt = rig.shirt;
      if (shirt) shirt.visible = SHOW_GARMENT && (ENABLE_IDLE_TEST || targets.hasShoulderAnchor);
      if (rig.boneDebug) rig.boneDebug.visible = Boolean(shirt?.visible);

      // Diagnostic idle animation, independent of the pose tracker.
      if (ENABLE_IDLE_TEST && shirt) {
        const t = clock.getElapsedTime();
        const swing = Math.sin(t * 2);
        const bend = Math.max(0, Math.sin(t * 3));

        if (rig.rightArm) rig.rightArm.rotation.z = swing * 0.6;
        if (rig.leftArm) rig.leftArm.rotation.z = -swing * 0.6;
        if (rig.rightElbow) rig.rightElbow.rotation.z = bend * 1.1;
        if (rig.leftElbow) rig.leftElbow.rotation.z = -bend * 1.1;
        if (rig.rootJoint) rig.rootJoint.rotation.z = Math.sin(t) * 0.3;
      }

      if (shirt?.visible && !ENABLE_IDLE_TEST) {
        if (!seeds.orientation) {
          applied.yaw = targets.yaw;
          applied.roll = targets.roll;
          seeds.orientation = true;
        } else {
          applied.yaw += shortestAngle(targets.yaw - applied.yaw) * smoothAlpha(dt, YAW_TAU_MS);
          applied.roll += (targets.roll - applied.roll) * smoothAlpha(dt, ROLL_TAU_MS);
        }
        shirt.rotation.set(0, applied.yaw, applied.roll);
        updateGarmentVisibility(rig.viewMaterials, applied.yaw);

        if (rig.sleeves && (targets.leftSleeve.tracked || targets.rightSleeve.tracked)) {
          const weight = seeds.arms ? smoothAlpha(dt, ARM_TAU_MS) : 1;
          poseSleeve(rig.sleeves.left, targets.leftSleeve, weight, sleeveScratch);
          poseSleeve(rig.sleeves.right, targets.rightSleeve, weight, sleeveScratch);
          seeds.arms = true;
        }
      }

      if (shirt && targets.hasShoulderAnchor) {
        if (!seeds.position) {
          applied.shoulderAnchor.copy(targets.shoulderAnchor);
          seeds.position = true;
        } else {
          applied.shoulderAnchor.lerp(targets.shoulderAnchor, smoothAlpha(dt, POSITION_TAU_MS));
        }

        // Align after posing so turning cannot move the shoulder anchor.
        if (rig.leftShoulderBone && rig.rightShoulderBone) {
          rig.leftShoulderBone.getWorldPosition(scratch.anchorA);
          rig.rightShoulderBone.getWorldPosition(scratch.anchorB);
          scratch.anchorMid.addVectors(scratch.anchorA, scratch.anchorB).multiplyScalar(0.5);
          shirt.position.add(scratch.anchorA.subVectors(applied.shoulderAnchor, scratch.anchorMid));
        } else {
          shirt.position.copy(applied.shoulderAnchor);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      window.visualViewport?.removeEventListener("resize", resize);
      dprMedia?.removeEventListener("change", handleDprChange);

      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [runtime, containerRef, webcamRef]);
}
