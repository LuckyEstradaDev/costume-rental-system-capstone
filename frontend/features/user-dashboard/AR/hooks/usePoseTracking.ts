import {useEffect} from "react";
import type {RefObject} from "react";
import {FilesetResolver, PoseLandmarker} from "@mediapipe/tasks-vision";
import {DETECT_INTERVAL_MS, MEASURE_TAU_MS} from "../config";
import {
  CHEST_CIRCUMFERENCE_ADJUSTMENT_IN,
  measureBody,
  shoulderWithAllowanceM,
} from "../lib/bodyFit";
import {publishFit, smoothBody} from "../lib/fitFeedback";
import {updateOverlayTargets} from "../lib/overlayTargets";
import {drawPoseDebug} from "../lib/poseDebug";
import type {ARRuntime, FitChipState, FitToastState} from "../types";
import {smoothAlpha} from "../utils/math";
import type {WebcamHandle} from "../components/WebCam";

/**
 * Runs MediaPipe pose detection and feeds the results into the shared runtime:
 * smoothed body measurements (for fit) and overlay targets (for rendering).
 * Inference is throttled to ~30 Hz; the render loop runs independently.
 */
export function usePoseTracking(
  runtime: ARRuntime,
  webcamRef: RefObject<WebcamHandle | null>,
  poseDebugRef: RefObject<HTMLCanvasElement | null>,
  setStatus: (message: string) => void,
  setFitChips: (state: FitChipState[] | null) => void,
  setFitToast: (state: FitToastState | null) => void,
): void {
  useEffect(() => {
    let poseLandmarker: PoseLandmarker | null = null;
    let animationFrameId = 0;
    let isMounted = true;
    let lastDetectAt = 0;
    let lastProcessedAt = 0;
    let lastVideoTime = -1;

    const setup = async () => {
      try {
        setStatus("Loading pose model...");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
        );

        const createLandmarker = (delegate: "GPU" | "CPU") =>
          PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: "/models/pose_landmarker_full.task",
              delegate,
            },
            runningMode: "VIDEO",
            numPoses: 1,
          });

        // GPU is much faster when supported; CPU keeps headless/older browsers working.
        try {
          poseLandmarker = await createLandmarker("GPU");
          console.log("[pose] using GPU delegate");
        } catch (gpuError) {
          console.warn("[pose] GPU delegate unavailable, using CPU", gpuError);
          poseLandmarker = await createLandmarker("CPU");
        }
        setStatus("Tracking body pose...");
      } catch (error) {
        console.error("Pose setup failed", error);
        setStatus("Pose setup failed. Please refresh and allow camera access.");
        return;
      }

      const predict = () => {
        if (!isMounted || !poseLandmarker) return;

        const video = webcamRef.current?.video;

        if (!video) {
          animationFrameId = requestAnimationFrame(predict);
          return;
        }

        if (video.readyState < 2) {
          if (video.paused) {
            void video.play().catch(() => {
              setStatus("Allow autoplay to start the pose tracker");
            });
          }
          animationFrameId = requestAnimationFrame(predict);
          return;
        }

        // Keep the video-fit rect in sync if the stream dimensions change.
        if (video.videoWidth !== runtime.lastVideoW || video.videoHeight !== runtime.lastVideoH) {
          runtime.lastVideoW = video.videoWidth;
          runtime.lastVideoH = video.videoHeight;
          runtime.updateVideoRect();
        }

        // Skip frames the camera has not advanced past, and throttle the rest.
        const now = performance.now();
        if (now - lastDetectAt < DETECT_INTERVAL_MS || video.currentTime === lastVideoTime) {
          animationFrameId = requestAnimationFrame(predict);
          return;
        }
        lastDetectAt = now;
        lastVideoTime = video.currentTime;

        const emaAlpha = lastProcessedAt ? smoothAlpha(now - lastProcessedAt, MEASURE_TAU_MS) : 1;
        lastProcessedAt = now;

        poseLandmarker.detectForVideo(video, now, (result) => {
          if (!result.landmarks?.length || !result.worldLandmarks?.length) {
            runtime.seeds.hadPose = false;
            setStatus("Waiting for pose...");
            if (poseDebugRef.current) {
              drawPoseDebug(poseDebugRef.current, runtime.videoRect, [], {
                shoulderM: null,
                torsoM: null,
                hipM: null,
                chestCircumferenceM: null,
                sleeveM: null,
              });
            }
            return;
          }

          // Shoulders alone are enough for the size estimate, so an upper-body
          // framing (hips cropped out) still produces a fit chip.
          const worldLandmarks = result.worldLandmarks[0];
          const measured = measureBody(worldLandmarks);
          if (measured) smoothBody(runtime, measured, emaAlpha);

          publishFit(runtime, setFitChips, setFitToast);
          updateOverlayTargets(runtime, result.landmarks, worldLandmarks, setStatus);

          if (poseDebugRef.current) {
            drawPoseDebug(poseDebugRef.current, runtime.videoRect, result.landmarks[0] ?? [], {
              shoulderM:
                runtime.body.shoulder === null
                  ? null
                  : shoulderWithAllowanceM(runtime.body.shoulder),
              torsoM: runtime.body.torso,
              hipM: runtime.body.hip,
              chestCircumferenceM:
                runtime.body.chest === null
                  ? null
                  : runtime.body.chest * 2 + CHEST_CIRCUMFERENCE_ADJUSTMENT_IN * 0.0254,
              sleeveM: runtime.body.sleeve,
            });
          }
        });

        animationFrameId = requestAnimationFrame(predict);
      };

      predict();
    };

    void setup();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      poseLandmarker?.close();
    };
  }, [runtime, webcamRef, poseDebugRef, setStatus, setFitChips, setFitToast]);
}
