import {useEffect} from "react";
import type {RefObject} from "react";
import {FilesetResolver, PoseLandmarker} from "@mediapipe/tasks-vision";
import {DETECT_INTERVAL_MS, MEASURE_TAU_MS, POSE_HOLD_MS} from "../config";
import {measureBody, shoulderWithAllowanceM} from "../lib/bodyFit";
import {smoothBody} from "../lib/fitFeedback";
import {updateOverlayTargets} from "../lib/overlayTargets";
import {drawPoseDebug} from "../lib/poseDebug";
import {captureSteadyValues, type MeasurementRequest} from "../lib/measurementCapture";
import type {ARRuntime} from "../types";
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
  measurementRequest: RefObject<MeasurementRequest | null>,
  cardShoulderRef: RefObject<number | null>,
): void {
  useEffect(() => {
    let poseLandmarker: PoseLandmarker | null = null;
    let animationFrameId = 0;
    let isMounted = true;
    let lastDetectAt = 0;
    let lastProcessedAt = 0;
    let lastVideoTime = -1;

    function losePose(now: number) {
      if (measurementRequest.current) measurementRequest.current.samples.length = 0;
      smoothBody(runtime, null, 1, now);
      updateOverlayTargets(runtime, [], [], now, setStatus);
      if (poseDebugRef.current) {
        drawPoseDebug(poseDebugRef.current, runtime.videoRect, [], {shoulderM: null, torsoM: null, sleeveM: null});
      }
    }

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
        if (!isMounted) {
          poseLandmarker.close();
          return;
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
        const now = performance.now();
        const stalled = !video || video.readyState < 2 || video.currentTime === lastVideoTime;
        if (stalled && lastProcessedAt > 0 && now - lastProcessedAt > POSE_HOLD_MS && now - lastDetectAt >= DETECT_INTERVAL_MS) {
          losePose(now);
          lastDetectAt = now;
        }

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
            losePose(now);
            return;
          }

          // Shoulders alone are enough for the size estimate, so an upper-body
          // framing (hips cropped out) still produces a fit chip.
          const worldLandmarks = result.worldLandmarks[0];
          const pose = result.landmarks[0];
          const measured = measureBody(worldLandmarks, pose);
          const request = measurementRequest.current;
          if (request) {
            const values = captureSteadyValues(request.samples, measured, pose,
              video.videoWidth / video.videoHeight, now, cardShoulderRef.current);
            if (values) {
              measurementRequest.current = null;
              request.complete(values);
            }
          }
          smoothBody(runtime, measured, emaAlpha, now);
          updateOverlayTargets(runtime, result.landmarks[0], worldLandmarks, now, setStatus);

          if (poseDebugRef.current) {
            const cardShoulder = cardShoulderRef.current;
            const scale = cardShoulder !== null && runtime.body.shoulder !== null && runtime.body.shoulder > 0
              ? cardShoulder / runtime.body.shoulder
              : runtime.refs.calibrationFactor.current;
            drawPoseDebug(poseDebugRef.current, runtime.videoRect, result.landmarks[0] ?? [], {
              shoulderM:
                runtime.body.shoulder === null
                  ? null
                  : shoulderWithAllowanceM(runtime.body.shoulder * scale),
              torsoM: runtime.body.torso === null ? null : runtime.body.torso * scale,
              sleeveM: runtime.body.sleeve === null ? null : runtime.body.sleeve * scale,
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
  }, [runtime, webcamRef, poseDebugRef, setStatus, measurementRequest, cardShoulderRef]);
}
