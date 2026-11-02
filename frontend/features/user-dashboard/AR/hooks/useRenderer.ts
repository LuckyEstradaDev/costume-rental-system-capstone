/* eslint-disable react-hooks/immutability */
import {useEffect} from "react";
import type {RefObject} from "react";
import * as THREE from "three";
import {
  ARM_TAU_MS,
  ENABLE_IDLE_TEST,
  POSITION_TAU_MS,
  ROLL_TAU_MS,
  SCALE_TAU_MS,
  SHOULDER_WIDEN,
  YAW_TAU_MS,
} from "../config";
import {computeVideoFit} from "../lib/objectFit";
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
      runtime.seeds.scale = false;
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

      const {rig, targets, applied, seeds} = runtime;
      const shirt = rig.shirt;

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

      if (shirt) {
        // Scale and anchor: snap onto the first target, then ease at display rate.
        if (targets.hasScale) {
          if (!seeds.scale) {
            shirt.scale.copy(targets.scale);
            seeds.scale = true;
          } else {
            shirt.scale.lerp(targets.scale, smoothAlpha(dt, SCALE_TAU_MS));
          }
        }

        if (targets.hasPosition) {
          if (!seeds.position) {
            shirt.position.copy(targets.position);
            seeds.position = true;
          } else {
            shirt.position.lerp(targets.position, smoothAlpha(dt, POSITION_TAU_MS));
          }
        }
      }

      if (shirt && !ENABLE_IDLE_TEST) {
        // Facing + shoulder tilt.
        if (rig.rootJoint) {
          rig.rootJoint.scale.x = SHOULDER_WIDEN;
          applied.yaw += shortestAngle(targets.yaw - applied.yaw) * smoothAlpha(dt, YAW_TAU_MS);
          if (!seeds.roll) {
            applied.roll = targets.roll;
            seeds.roll = true;
          } else {
            applied.roll += (targets.roll - applied.roll) * smoothAlpha(dt, ROLL_TAU_MS);
          }
          rig.rootJoint.rotation.set(0, applied.yaw, applied.roll);
        }

        // Arms: ease toward the solver's targets (or back to the rest pose).
        if (targets.hasArm && rig.armRest) {
          if (!seeds.arms) {
            applied.armZR = targets.armZR;
            applied.elbowZR = targets.elbowZR;
            applied.armZL = targets.armZL;
            applied.elbowZL = targets.elbowZL;
            seeds.arms = true;
          } else {
            const k = smoothAlpha(dt, ARM_TAU_MS);
            applied.armZR += (targets.armZR - applied.armZR) * k;
            applied.elbowZR += (targets.elbowZR - applied.elbowZR) * k;
            applied.armZL += (targets.armZL - applied.armZL) * k;
            applied.elbowZL += (targets.elbowZL - applied.elbowZL) * k;
          }

          if (rig.rightArm) rig.rightArm.rotation.z = applied.armZR;
          if (rig.rightElbow) rig.rightElbow.rotation.z = applied.elbowZR;
          if (rig.leftArm) rig.leftArm.rotation.z = applied.armZL;
          if (rig.leftElbow) rig.leftElbow.rotation.z = applied.elbowZL;
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
