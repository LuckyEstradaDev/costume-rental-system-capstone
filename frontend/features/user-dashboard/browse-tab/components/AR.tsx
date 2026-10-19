/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {SetStateAction, useEffect, useRef, useState} from "react";
import WebCam, {WebcamHandle} from "./WebCam";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {Shirt, TriangleAlert, X, Ruler} from "lucide-react";
import * as THREE from "three";
import {
  bideltoidFromJoint,
  ema,
  evaluateFit,
  fitChipLabel,
  measureBody,
  measurementRenderFactor,
  medianWindow,
  normalizeOutfitSizes,
  sizeFromShoulderWidth,
  type BodyMeasurements,
  type GarmentMeasurements,
} from "../lib/bodyFit";
import {computeVideoFit} from "../lib/objectFit";
import {
  A4_LONG_EDGE_M,
  clearCalibration,
  computeCalibration,
  loadCalibration,
  median,
  saveCalibration,
  type CalibrationResult,
} from "../lib/calibration";
import {FilesetResolver, PoseLandmarker} from "@mediapipe/tasks-vision";

/* ------------------------------------------------------------------ *
 * Fit / sizing tuning
 * ------------------------------------------------------------------ */

/** Depth plane (world units) the garment is anchored to, in front of camera. */
const ANCHOR_DEPTH = 1.5;

/**
 * The rig is authored 1:1 in metres (Blender default), so one model unit is one
 * real metre. This is the single calibration knob: if the overlay renders too
 * large/small, set it to (true garment length) / (rendered length).
 */
const METERS_PER_MODEL_UNIT = 1.0;

/**
 * Real garment size the model represents. Picking another size scales the mesh
 * by the size-chart ratio from here — a real L is physically bigger than M.
 */
const BASE_GARMENT_SIZE = "M";

/**
 * Lateral stretch applied to the rig's root spine bone. It does NOT change the
 * on-screen shoulder width (the fit maths measures the model after widening and
 * normalises it away) — it only reshapes the mesh, so keep it at 1 for a
 * well-rigged garment like Barong.glb. Raise it only for models whose shoulders
 * read too narrow for their torso.
 */
const SHOULDER_WIDEN = 1;

/** Used when the rig's shoulder joints cannot be measured at load time. */
const FALLBACK_MODEL_SHOULDER = 0.174;

/**
 * The A4 calibration rectangle, as a fraction of the camera frame's WIDTH. The
 * user fills it with a landscape A4 sheet, so the sheet's on-screen span *is*
 * this fraction of the frame — the calibration ratio needs no pixel measuring.
 *
 * Purely a UX knob: for a correctly aligned sheet the result is independent of
 * this value (the user just stands farther away for a bigger rectangle), so it
 * trades effort for precision — smaller is easier to fill from a distance, but
 * makes a given alignment error a larger relative error.
 */
const A4_FRAME_FRACTION = 0.35;

/** A4 landscape height : width (210 : 297), for drawing the rectangle. */
const A4_ASPECT = 210 / 297;

/**
 * Easing time constants (ms) for the render loop. Targets are produced by the
 * tracker at ~30 Hz but applied every display frame, and each frame closes a
 * `1 - exp(-dt / tau)` fraction of the gap to the target — so the feel is the
 * same whether the device detects at 15 or 30 fps. Smaller tau = snappier.
 */
const SCALE_TAU_MS = 180;
const YAW_TAU_MS = 140;
const ROLL_TAU_MS = 140;
const POSITION_TAU_MS = 90;
const ARM_TAU_MS = 80;

/** Time constant (ms) for the body-measurement EMA (shoulder/torso/hip). */
const MEASURE_TAU_MS = 120;

/**
 * Minimum landmark visibility before it is trusted. Shoulders gate the whole
 * overlay update (the garment freezes instead of jumping when they are
 * occluded); hips gate the vertical-span scale estimate; elbows and wrists
 * gate the arm solver (a hidden arm eases back to its rest pose).
 */
const SHOULDER_VIS_MIN = 0.6;
const HIP_VIS_MIN = 0.6;
const LIMB_VIS_MIN = 0.5;

/**
 * Flip to -1 if the garment turns the wrong way when the body faces sideways.
 * Front/back are unaffected — only the left/right sense of a turn depends on
 * MediaPipe's depth-axis convention.
 */
const YAW_SIGN = -1;

/**
 * Softening for the arm solver's yaw compensation. On screen an arm's angle
 * foreshortens by cos(yaw), so the solver divides that back out — but a
 * side-on body would divide by ~0. This keeps the gain finite and smoothly
 * lets the arms rest when the body is edge-on.
 */
const ARM_YAW_EPS = 0.08;

/**
 * Diagnostic switch. While true, the arm/elbow/spine bones play a looping sine
 * "idle" animation and the pose-driven rotations are skipped, so you can verify
 * the rig deforms on its own. Set to false to let body tracking drive the bones.
 */
const ENABLE_IDLE_TEST = false;

/**
 * Vertical nudge for the garment in world units (positive lifts it).
 * Leave at 0 unless the rig's shoulder joints sit away from the mesh's
 * shoulder seam — then nudge until the seam lands on the shoulder.
 */
const GARMENT_Y_OFFSET = 0;

/** A warning must hold this long before it shows, before it clears. */
const FIT_CONFIRM_MS = 600;
const FIT_CONFIRM_OK_MS = 400;

/** Wraps an angle to (-pi, pi] so pose deltas take the short way round. */
const shortestAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * Fraction of the remaining gap an exponential ease should close for a frame
 * of `dtMs` with time constant `tauMs` — frame-rate independent smoothing.
 */
const smoothAlpha = (dtMs: number, tauMs: number) => 1 - Math.exp(-dtMs / tauMs);

/**
 * One arm bone's rest-pose reference. Captured once at load so the per-frame
 * pose maths is measured relative to how the rig was modelled instead of
 * assuming the arms start laid out flat. `zSign` records whether the bone's
 * local Z points the same way as world Z, since the two sides are mirrored.
 */
type ArmCalibration = {
  /** screen-plane angle (rad) of the upper arm at rest */
  upAngle: number;
  /** +1 when the bone's local Z aligns with world Z, else -1 */
  upZSign: number;
  /** the bone's rest local Z rotation */
  upLocalZ: number;
  /** screen-plane angle (rad) of the forearm at rest */
  foreAngle: number;
  foreZSign: number;
  elbowLocalZ: number;
};

type FitTone = "red" | "amber" | "green";

type FitChipState = {label: string; tone: FitTone};
type FitToastState = {text: string; tone: "red" | "amber"};

const CHIP_TONES: Record<FitTone, string> = {
  green: "bg-emerald-600/85",
  amber: "bg-amber-600/85",
  red: "bg-red-600/85",
};

const TOAST_TONES = {
  red: "border-red-500/50 bg-red-950/85 text-red-100 [&_svg]:text-red-400",
  amber: "border-amber-500/50 bg-amber-950/85 text-amber-100 [&_svg]:text-amber-400",
};

const sizePillClass = (active: boolean) =>
  `rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
    active ? "bg-white text-black" : "text-white/70 hover:bg-white/10 hover:text-white"
  }`;

export function AR({
  modelUrl,
  sizes,
  sizeMeasurements,
  onClose,
}: {
  modelUrl: string;
  sizes?: readonly string[];
  /** Real per-size garment measurements (inches), keyed by size label. */
  sizeMeasurements?: Record<string, GarmentMeasurements>;
  onClose: React.Dispatch<SetStateAction<boolean>>;
}) {
  const webcamRef = useRef<WebcamHandle | null>(null);
  const threeContainerRef = useRef<HTMLDivElement | null>(null);
  const [statusMessage, setStatusMessage] = useState("Starting camera...");

  // Fit feedback: only re-renders when the verdict actually changes.
  const [fitChip, setFitChip] = useState<FitChipState | null>(null);
  const [fitToast, setFitToast] = useState<FitToastState | null>(null);

  // Size the user picked. There is no Auto estimate: when nothing is picked we
  // fall back to the outfit's first offered size (see `activeSize`).
  const [pickedSize, setPickedSize] = useState<string | null>(null);
  const pickedSizeRef = useRef<string | null>(null);

  // The outfit's real size range, read by the pose loop through a ref so a
  // sizes change never tears down the Three.js scene.
  const sizesRef = useRef<readonly string[] | undefined>(sizes);

  // Real per-size garment measurements, same ref pattern as the sizes.
  const sizeMeasurementsRef = useRef<Record<string, GarmentMeasurements> | undefined>(
    sizeMeasurements,
  );

  // Only offer sizes this outfit is actually cut in.
  const offeredSizes = normalizeOutfitSizes(sizes);

  // The size in effect: the user's pick, or the first offered size by default
  // (guarding against a pick that is no longer offered).
  const activeSize =
    pickedSize && offeredSizes.includes(pickedSize) ? pickedSize : (offeredSizes[0] ?? null);

  // Reference calibration (A4 sheet). The correction reshapes only the fit
  // verdict, never the rendered garment. Persisted per browser, so the factor
  // is read once at mount (lazy initializer) and mirrored into a ref the pose
  // loop can read without re-subscribing.
  const [calibrationFactor, setCalibrationFactor] = useState(
    () => loadCalibration()?.factor ?? 1,
  );
  const calibrationFactorRef = useRef(calibrationFactor);
  // First-time users are asked to calibrate before anything else; returning
  // users who already have a saved factor go straight to the try-on.
  const [calibrationOpen, setCalibrationOpen] = useState(
    () => loadCalibration() === null,
  );
  const [calibrationMessage, setCalibrationMessage] = useState(() =>
    loadCalibration() === null
      ? "First, calibrate with an A4 sheet so the fit verdict is accurate."
      : "",
  );
  // Counts down 10→1 after the user says they're ready, so they can steady the
  // sheet and face the camera before the measurement window opens.
  const [calibrationCountdown, setCalibrationCountdown] = useState<number | null>(null);
  const [calibrationResult, setCalibrationResult] = useState<CalibrationResult | null>(null);
  const [calibrationBox, setCalibrationBox] = useState<{
    w: number;
    h: number;
    vw: number;
    vh: number;
  } | null>(null);
  // Latest pose metrics the calibrator samples while the sheet is held up.
  const calibrationSampleRef = useRef<{
    shoulderM: number | null;
    shoulderFrac: number | null;
    cosYaw: number;
  }>({shoulderM: null, shoulderFrac: null, cosYaw: 0});

  const calibrationRect = calibrationBox
    ? computeVideoFit(calibrationBox.w, calibrationBox.h, calibrationBox.vw, calibrationBox.vh)
    : null;
  const calibrated = calibrationFactor !== 1;

  useEffect(() => {
    if (!calibrationOpen) return;
    const update = () => {
      const el = threeContainerRef.current;
      const video = webcamRef.current?.video;
      if (!el) return;
      setCalibrationBox((current) => {
        const next = {
          w: el.clientWidth,
          h: el.clientHeight,
          vw: video?.videoWidth ?? 0,
          vh: video?.videoHeight ?? 0,
        };
        return current &&
          current.w === next.w &&
          current.h === next.h &&
          current.vw === next.vw &&
          current.vh === next.vh
          ? current
          : next;
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    // The overlay can open before the stream reports its dimensions, and the
    // video size can settle late — poll so the rectangle appears (and stays mapped)
    // as soon as the frame geometry is known.
    const id = window.setInterval(update, 200);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.clearInterval(id);
    };
  }, [calibrationOpen]);

  useEffect(() => {
    pickedSizeRef.current = activeSize;
  }, [activeSize]);

  useEffect(() => {
    sizesRef.current = sizes;
  }, [sizes]);

  useEffect(() => {
    sizeMeasurementsRef.current = sizeMeasurements;
  }, [sizeMeasurements]);

  // Single writer for the status line: repeated identical messages (this runs
  // every frame) never trigger a re-render.
  const statusRef = useRef("");
  const setStatus = (message: string) => {
    if (message !== statusRef.current) {
      statusRef.current = message;
      setStatusMessage(message);
    }
  };

  const openCalibration = () => {
    setCalibrationMessage("");
    setCalibrationCountdown(null);
    setCalibrationResult(null);
    setCalibrationOpen(true);
  };

  const closeCalibration = () => {
    setCalibrationCountdown(null);
    setCalibrationResult(null);
    setCalibrationMessage("");
    setCalibrationOpen(false);
  };

  const applyCalibration = (factor: number) => {
    calibrationFactorRef.current = factor;
    setCalibrationFactor(factor);
    saveCalibration(factor);
  };

  const resetCalibration = () => {
    calibrationFactorRef.current = 1;
    setCalibrationFactor(1);
    clearCalibration();
  };

  const captureCalibration = () => {
    if (calibrationCountdown !== null) return;
    setCalibrationResult(null);
    setCalibrationMessage("Get ready — hold the sheet steady and face the camera.");
    setCalibrationCountdown(10);
  };

  // Countdown ticks 10→1, then a ~1 s sampling window takes the median of each
  // span before the correction is computed.
  useEffect(() => {
    if (calibrationCountdown === null) return;
    if (calibrationCountdown > 0) {
      const id = window.setTimeout(
        () => setCalibrationCountdown((current) => (current === null ? null : current - 1)),
        1000,
      );
      return () => window.clearTimeout(id);
    }

    const shoulderFracs: number[] = [];
    const shoulderMs: number[] = [];
    let ticks = 0;
    const id = window.setInterval(() => {
      if (ticks === 0) setCalibrationMessage("Hold still…");
      const sample = calibrationSampleRef.current;
      if (
        sample.shoulderFrac !== null &&
        sample.shoulderM !== null &&
        sample.shoulderM > 0 &&
        sample.cosYaw > 0.85
      ) {
        shoulderFracs.push(sample.shoulderFrac);
        shoulderMs.push(sample.shoulderM);
      }
      ticks += 1;
      if (ticks >= 20) {
        window.clearInterval(id);
        setCalibrationCountdown(null);
        const shoulderFrac = median(shoulderFracs);
        const shoulderM = median(shoulderMs);
        // The sheet fills the A4 rectangle, so its image span is exactly the
        // rectangle's frame fraction.
        const result =
          shoulderFrac !== null && shoulderM !== null
            ? computeCalibration({
                referenceM: A4_LONG_EDGE_M,
                refFrac: A4_FRAME_FRACTION,
                shoulderFrac,
                mediapipeShoulderM: shoulderM,
              })
            : null;
        if (result === null) {
          setCalibrationMessage(
            "Couldn't calibrate — face the camera, hold the sheet steady, and try again.",
          );
        } else {
          // Show the result for review; the user applies it (or retries).
          setCalibrationMessage("");
          setCalibrationResult(result);
        }
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [calibrationCountdown]);

  useEffect(() => {
    let poseLandmarker: PoseLandmarker | null = null;
    let animationFrameId = 0;
    let isMounted = true;

    //model
    let shirt: THREE.Object3D | null = null;
    let rightArm: THREE.Bone | null = null; //inverted
    let leftArm: THREE.Bone | null = null;
    let rightElbowBone: THREE.Bone | null = null;
    let leftElbowBone: THREE.Bone | null = null;
    let rootJoint: THREE.Bone | null = null;
    let hasArmRig = false;
    let leftShoulderBone: THREE.Object3D | null = null;
    let rightShoulderBone: THREE.Object3D | null = null;

    // Rest-pose reference for the arms, captured once after binding.
    let armRest: {right: ArmCalibration; left: ArmCalibration} | null = null;

    // Model dimensions measured once at load (local units). The `measured`
    // flags are false when a span fell back to a guessed value, so the fit
    // maths can skip the absolute (model-relative) render factor for it.
    const modelShoulderWidthRef = {value: 0};
    const modelShoulderMeasuredRef = {value: false};
    const modelHeightRef = {value: 0};
    const modelHeightMeasuredRef = {value: false};

    // Scratch vectors reused every frame (avoids per-frame allocation).
    const targetScaleVec = new THREE.Vector3(1, 1, 1);
    const targetShirtPos = new THREE.Vector3();
    const anchorA = new THREE.Vector3();
    const anchorB = new THREE.Vector3();
    const anchorMid = new THREE.Vector3();
    const leftShoulderWorld = new THREE.Vector3();
    const rightShoulderWorld = new THREE.Vector3();
    const leftHipWorld = new THREE.Vector3();
    const rightHipWorld = new THREE.Vector3();
    const midPoint = new THREE.Vector3();

    // Overlay targets written by the tracker (~30 Hz). The render loop eases
    // the model toward them every display frame so motion stays smooth
    // regardless of the detection rate.
    let targetYaw = 0;
    let targetRoll = 0;
    let targetArmZR = 0;
    let targetElbowZR = 0;
    let targetArmZL = 0;
    let targetElbowZL = 0;
    let hasScaleTarget = false;
    let hasPosTarget = false;
    let hasArmTarget = false;

    // Eased values the render loop actually applies to the model.
    // `garmentYaw` faces the body: 0 = chest to camera, +-PI/2 = side-on,
    // +-PI = back to camera.
    let garmentYaw = 0;
    let appliedRoll = 0;
    let appliedArmZR = 0;
    let appliedElbowZR = 0;
    let appliedArmZL = 0;
    let appliedElbowZL = 0;

    // Seeding: the first update after acquiring a pose snaps instead of
    // easing, so the garment cannot swing in from its previous spot.
    let scaleSeeded = false;
    let posSeeded = false;
    let rollSeeded = false;
    let armsSeeded = false;
    let hadPose = false;

    // Cached video-fit rect (object-fit aware) used to map landmarks onto the
    // canvas. Recomputed on resize / orientation change and once the stream's
    // dimensions become known.
    let videoRect: {
      offsetX: number;
      offsetY: number;
      drawW: number;
      drawH: number;
      w: number;
      h: number;
      fit: "cover" | "contain";
    } | null = null;
    let lastVideoW = 0;
    let lastVideoH = 0;

    // Maps a MediaPipe landmark (x,y in 0-1 of the camera stream) onto the
    // anchor plane, writing into `out` so no vectors are allocated per frame.
    // The landmark is first placed into the canvas's normalized space through
    // the video's on-screen (object-fit) rect, so the overlay stays locked to
    // the body no matter how the window size letterboxes or crops the video. x
    // is then flipped to match the mirrored video; y is flipped because
    // MediaPipe y grows downward.
    const landmarkToWorld = (
      landmark: {x: number; y: number},
      cam: THREE.PerspectiveCamera,
      depth: number,
      out: THREE.Vector3,
    ) => {
      let nx = landmark.x;
      let ny = landmark.y;
      if (videoRect) {
        nx = (videoRect.offsetX + landmark.x * videoRect.drawW) / videoRect.w;
        ny = (videoRect.offsetY + landmark.y * videoRect.drawH) / videoRect.h;
      }
      out.set(-(nx * 2 - 1), -(ny * 2 - 1), 0.5);
      out.unproject(cam);
      out.sub(cam.position).normalize();
      out.multiplyScalar((depth - cam.position.z) / out.z);
      return out.add(cam.position);
    };

    // Detection runs at most this often. The render loop still runs at the
    // display refresh rate; pose inference (the expensive part) is throttled so
    // it does not run more than ~30x a second.
    const DETECT_INTERVAL_MS = 1000 / 30;
    let lastDetectAt = 0;
    let lastProcessedAt = 0;
    let lastVideoTime = -1;

    // Body measurements, smoothed over time (metres).
    const body = {
      shoulder: null as number | null,
      torso: null as number | null,
      hip: null as number | null,
      /** last measured size letter, used for the deadband + garment scaling */
      size: null as string | null,
    };

    // Rolling windows feeding a median pre-filter — one noisy frame (motion
    // blur, a limb crossing a joint) cannot skew the EMA.
    const shoulderWindow: number[] = [];
    const torsoWindow: number[] = [];
    const hipWindow: number[] = [];

    // Fit verdict debounce.
    let candidateKey = "";
    let candidateSince = 0;
    let acceptedKey = "";
    let lastPickedSeen: string | undefined | null;
    let lastScaleKey = "";

    /**
     * Turns smoothed body measurements into the chip + toast. A verdict only
     * lands after it has been stable for a moment, so nothing flickers — except
     * when the user picks a size, which is judged immediately.
     */
    const updateFit = (measurements: BodyMeasurements | null) => {
      // Reference calibration rescales the tracker's metric estimate; the
      // rendered garment keeps its raw tracking so only the verdict shifts.
      const k = calibrationFactorRef.current;
      const calibrated =
        measurements && k !== 1
          ? {
              shoulderWidth: measurements.shoulderWidth * k,
              torsoLength: measurements.torsoLength === null ? null : measurements.torsoLength * k,
              hipWidth: measurements.hipWidth === null ? null : measurements.hipWidth * k,
            }
          : measurements;

      const picked = pickedSizeRef.current;
      const fit = evaluateFit(
        calibrated,
        body.size,
        picked,
        sizesRef.current,
        sizeMeasurementsRef.current,
      );

      // Keep the measured size: it feeds the size deadband and the scaling of
      // the garment to the size that was picked. The chart and garment numbers
      // are seam-to-seam widths, so convert the raw joint span first.
      if (calibrated && calibrated.shoulderWidth > 0) {
        body.size = sizeFromShoulderWidth(
          bideltoidFromJoint(calibrated.shoulderWidth),
          body.size,
        );
      }

      const pickedChanged = lastPickedSeen !== undefined && picked !== lastPickedSeen;
      lastPickedSeen = picked;

      // The calibration factor is part of the key so the chip/toast refresh when
      // it changes, instead of lingering with pre-calibration numbers.
      const key = `${fit.kind}|${fit.size ?? ""}|${picked ?? "auto"}|${k}`;
      const now = performance.now();

      if (key !== candidateKey) {
        candidateKey = key;
        candidateSince = pickedChanged ? 0 : now;
      }

      const settleMs = fit.kind === "fits" || fit.kind === "unknown" ? FIT_CONFIRM_OK_MS : FIT_CONFIRM_MS;
      if (now - candidateSince < settleMs || key === acceptedKey) return;

      acceptedKey = key;

      // Handy when tuning the size chart: prints once per verdict change.
      console.debug("[fit]", key, calibrated);

      const label = fitChipLabel(fit);
      setFitChip(label && fit.tone ? {label, tone: fit.tone} : null);
      setFitToast(
        fit.toast && fit.tone !== "green" ? {text: fit.toast, tone: fit.tone === "red" ? "red" : "amber"} : null,
      );
    };

    const clock = new THREE.Clock();

    const loader = new GLTFLoader();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    camera.position.set(0, 1.2, 4.5);
    camera.lookAt(0, 1.2, 0);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      powerPreference: "high-performance",
    });

    // The canvas and the webcam video share this full-viewport container; its
    // box is the reference frame for the camera and for mapping landmarks.
    const container = threeContainerRef.current;

    // Recompute the video's on-screen rect (object-fit aware). Keeping this in
    // lockstep with the mapping means the garment lands on the body whether the
    // video is cropped (cover) or letterboxed (contain).
    const updateVideoRect = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const video = webcamRef.current?.video;
      const vw = video?.videoWidth ?? 0;
      const vh = video?.videoHeight ?? 0;
      const fit = computeVideoFit(w, h, vw, vh);
      if (!fit) {
        videoRect = null;
        return;
      }
      videoRect = {...fit, w, h};
      if (video) video.style.objectFit = fit.fit;
    };

    // Keep the renderer buffer, camera frustum and video rect matched to the
    // container across window resizes, orientation changes, mobile URL-bar
    // shows/hides and moves between displays with a different pixel ratio.
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
      scaleSeeded = false;
      posSeeded = false;
    };

    // The canvas is a replaced element: without an explicit CSS box it keeps
    // its drawing-buffer size, so on any devicePixelRatio != 1 the overlay
    // renders at dpr x the body's coordinates and drifts from the webcam. Pin
    // the canvas CSS box to the container (the buffer stays w*dpr for
    // sharpness) so the overlay maps 1:1 with the video at every screen size.
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.zIndex = "25";
    renderer.domElement.style.pointerEvents = "none";
    threeContainerRef.current?.appendChild(renderer.domElement);

    resize();

    const resizeObserver = new ResizeObserver(resize);
    if (container) resizeObserver.observe(container);
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    window.visualViewport?.addEventListener("resize", resize);

    // A pixel-ratio change (monitor switch, browser zoom) does not always fire
    // a resize, so watch the active resolution query and refresh the buffer.
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

    let lastFrameAt = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = lastFrameAt ? now - lastFrameAt : 1000 / 60;
      lastFrameAt = now;

      // Idle test animation: swings the bound arm/elbow/spine bones with sine
      // waves, independent of the pose tracker, so you can confirm the rig
      // deforms at all. Set ENABLE_IDLE_TEST to false to hand the bones back to
      // the pose tracker.
      if (ENABLE_IDLE_TEST && shirt) {
        const t = clock.getElapsedTime();
        const swing = Math.sin(t * 2);
        const bend = Math.max(0, Math.sin(t * 3));

        if (rightArm) rightArm.rotation.z = swing * 0.6;
        if (leftArm) leftArm.rotation.z = -swing * 0.6;
        if (rightElbowBone) rightElbowBone.rotation.z = bend * 1.1;
        if (leftElbowBone) leftElbowBone.rotation.z = -bend * 1.1;
        if (rootJoint) rootJoint.rotation.z = Math.sin(t) * 0.3;
      }

      if (shirt) {
        // Scale: snap onto the first target, then ease at display rate.
        if (hasScaleTarget) {
          if (!scaleSeeded) {
            shirt.scale.copy(targetScaleVec);
            scaleSeeded = true;
          } else {
            shirt.scale.lerp(targetScaleVec, smoothAlpha(dt, SCALE_TAU_MS));
          }
        }

        // Anchor position: same seeding rule, then time-based easing.
        if (hasPosTarget) {
          if (!posSeeded) {
            shirt.position.copy(targetShirtPos);
            posSeeded = true;
          } else {
            shirt.position.lerp(targetShirtPos, smoothAlpha(dt, POSITION_TAU_MS));
          }
        }
      }

      if (shirt && !ENABLE_IDLE_TEST) {
        // Facing (yaw) + shoulder tilt (roll), eased toward the tracker's
        // targets.
        if (rootJoint) {
          rootJoint.scale.x = SHOULDER_WIDEN;
          garmentYaw += shortestAngle(targetYaw - garmentYaw) * smoothAlpha(dt, YAW_TAU_MS);
          if (!rollSeeded) {
            appliedRoll = targetRoll;
            rollSeeded = true;
          } else {
            appliedRoll += (targetRoll - appliedRoll) * smoothAlpha(dt, ROLL_TAU_MS);
          }
          rootJoint.rotation.set(0, garmentYaw, appliedRoll);
        }

        // Arms: ease toward the solver's targets (or back to the rest pose
        // while the elbow/wrist landmarks are hidden).
        if (hasArmTarget && armRest) {
          if (!armsSeeded) {
            appliedArmZR = targetArmZR;
            appliedElbowZR = targetElbowZR;
            appliedArmZL = targetArmZL;
            appliedElbowZL = targetElbowZL;
            armsSeeded = true;
          } else {
            const k = smoothAlpha(dt, ARM_TAU_MS);
            appliedArmZR += (targetArmZR - appliedArmZR) * k;
            appliedElbowZR += (targetElbowZR - appliedElbowZR) * k;
            appliedArmZL += (targetArmZL - appliedArmZL) * k;
            appliedElbowZL += (targetElbowZL - appliedElbowZL) * k;
          }

          if (rightArm) rightArm.rotation.z = appliedArmZR;
          if (rightElbowBone) rightElbowBone.rotation.z = appliedElbowZR;
          if (leftArm) leftArm.rotation.z = appliedArmZL;
          if (leftElbowBone) leftElbowBone.rotation.z = appliedElbowZL;
        }
      }

      renderer.render(scene, camera);
    };

    loader.load(
      modelUrl,
      (gltf: {scene: any}) => {
        shirt = gltf.scene;
        if (!shirt) {
          console.error("Failed to load shirt model");
          return;
        }

        // Bone names are normalized before matching: three.js strips reserved
        // characters ('.', '/', ':', '[]') from glTF node names, so the Barong
        // bone "arm.l" arrives as "arml" and "forearm.r" as "forearmr". Matching
        // on the normalized key binds both the Blender names (arm.l / forearm.r /
        // shoulder.l) and the old shirt names (upperarm_l_014 / lowerarm_r_0149 /
        // _rootJoint). If the model has no skeleton (a static mesh), all bones
        // stay null and the rig block below is skipped instead of crashing.
        shirt.traverse((child: any) => {
          if (!child.isBone) return;

          const key = (child.name as string).toLowerCase().replace(/[^a-z0-9]/g, "");

          if (!rightArm && (key === "arml" || key.startsWith("upperarml"))) {
            rightArm = child;
          }

          if (!leftArm && (key === "armr" || key.startsWith("upperarmr"))) {
            leftArm = child;
          }

          if (!rightElbowBone && (key === "forearml" || key.startsWith("lowerarml"))) {
            rightElbowBone = child;
          }

          if (!leftElbowBone && (key === "forearmr" || key.startsWith("lowerarmr"))) {
            leftElbowBone = child;
          }

          if (!rightShoulderBone && key === "shoulderl") {
            rightShoulderBone = child;
          }

          if (!leftShoulderBone && key === "shoulderr") {
            leftShoulderBone = child;
          }

          if (!rootJoint && (key.includes("rootjoint") || key.endsWith("spine3") || key === "neutralbone")) {
            rootJoint = child;
          }
        });

        // Rigs without dedicated shoulder bones (e.g. the old shirt) fall back to
        // the upper-arm joints for measuring / anchoring the shoulder line.
        if (!rightShoulderBone) rightShoulderBone = rightArm;
        if (!leftShoulderBone) leftShoulderBone = leftArm;

        hasArmRig = Boolean(rightArm && rightElbowBone && leftArm && leftElbowBone);
        console.log("[bones] resolved", {
          rightArm: rightArm?.name,
          leftArm: leftArm?.name,
          rightElbowBone: rightElbowBone?.name,
          leftElbowBone: leftElbowBone?.name,
          rightShoulderBone: rightShoulderBone?.name,
          leftShoulderBone: leftShoulderBone?.name,
          rootJoint: rootJoint?.name,
          hasArmRig,
        });
        if (!rootJoint && !hasArmRig) {
          console.warn(
            `"${modelUrl}" has no skeleton - rendering it as a static overlay. ` +
              "Re-export with an armature/skin to enable pose-driven rigging.",
          );
        }
        shirt.position.set(0, 0, 0);
        shirt.scale.set(1, 1, 1);
        shirt.rotation.set(0, 0, 0);
        scene.add(shirt);
        scene.add(new THREE.AmbientLight(0xffffff, 2));
        const dir = new THREE.DirectionalLight(0xffffff, 2);
        dir.position.set(5, 5, 5);
        scene.add(dir);

        // Shoulder width is applied once here (not every frame) so the fit
        // maths below owns the width from now on.
        if (rootJoint) {
          rootJoint.scale.x = SHOULDER_WIDEN;
        }

        // Measure the model's own shoulder span and height (in model units =
        // metres) so the garment can be rendered at a picked size's REAL
        // measurements. Shoulder drives width; height drives length.
        shirt.updateMatrixWorld(true);
        if (leftShoulderBone && rightShoulderBone) {
          const a = new THREE.Vector3();
          const b = new THREE.Vector3();
          leftShoulderBone.getWorldPosition(a);
          rightShoulderBone.getWorldPosition(b);
          const width = a.distanceTo(b);
          if (width > 0.02 && width < 5) {
            modelShoulderWidthRef.value = width;
            modelShoulderMeasuredRef.value = true;
          }
        }
        if (!modelShoulderWidthRef.value) {
          console.warn("Could not measure model shoulders, using fallback width", FALLBACK_MODEL_SHOULDER);
          modelShoulderWidthRef.value = FALLBACK_MODEL_SHOULDER;
        }
        const bbox = new THREE.Box3().setFromObject(shirt);
        const height = bbox.max.y - bbox.min.y;
        if (height > 0.2 && height < 2.5) {
          modelHeightRef.value = height;
          modelHeightMeasuredRef.value = true;
        }
        console.log(
          "[model] shoulder span / height (model units / metres):",
          modelShoulderWidthRef.value.toFixed(3),
          height.toFixed(3),
        );

        // Capture the arms' rest pose so per-frame posing is applied as a delta
        // from how the rig was modelled. Driving the bones with an absolute
        // screen angle assumes the arms start flat and ignores the y-flip, which
        // is what made lowering the arms raise the model.
        if (hasArmRig && rightArm && leftArm && rightElbowBone && leftElbowBone) {
          const measureArm = (arm: THREE.Bone, elbow: THREE.Bone): ArmCalibration => {
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

            return {
              upAngle,
              upZSign,
              upLocalZ: arm.rotation.z,
              foreAngle,
              foreZSign,
              elbowLocalZ: elbow.rotation.z,
            };
          };

          armRest = {
            right: measureArm(rightArm, rightElbowBone),
            left: measureArm(leftArm, leftElbowBone),
          };
          console.log("[arms] rest calibration", armRest);
        }
      },
      undefined,
      (error) => {
        console.error("Failed to load outfit model", modelUrl, error);
        if (isMounted) setStatus("Failed to load the 3D model. Please try again.");
      },
    );

    animate();

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

        // The GPU delegate is several times faster when the browser supports it;
        // fall back to CPU so headless/older environments still work.
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

      const predict = async () => {
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

        // Keep the video-fit rect in sync if the stream dimensions change (e.g.
        // camera switches resolution, orientation flips).
        if (video.videoWidth !== lastVideoW || video.videoHeight !== lastVideoH) {
          lastVideoW = video.videoWidth;
          lastVideoH = video.videoHeight;
          updateVideoRect();
        }

        // Throttle the expensive pose inference; the render loop keeps running
        // at the display rate independently. Re-running inference on a frame
        // the camera has not advanced past is pure waste (the same pose gets
        // measured twice), so skip those too.
        const now = performance.now();
        if (now - lastDetectAt < DETECT_INTERVAL_MS || video.currentTime === lastVideoTime) {
          animationFrameId = requestAnimationFrame(predict);
          return;
        }
        lastDetectAt = now;
        lastVideoTime = video.currentTime;

        // Time-based measurement smoothing: the EMA closes the same fraction
        // of the gap per millisecond no matter what the detection rate is.
        const emaAlpha = lastProcessedAt ? smoothAlpha(now - lastProcessedAt, MEASURE_TAU_MS) : 1;
        lastProcessedAt = now;

        poseLandmarker.detectForVideo(video, now, (result) => {
          if (!result.landmarks?.length || !result.worldLandmarks?.length) {
            hadPose = false;
            setStatus("Waiting for pose...");
            return;
          }

          // Body measurements in metres → clothing size + fit verdict.
          // Shoulders alone are enough for the size estimate, so an upper-body
          // framing (hips cropped out) still produces a fit chip.
          const worldLandmarks = result.worldLandmarks[0];
          const measured = measureBody(worldLandmarks);
          if (measured) {
            // Median of the last few frames first (rejects outlier frames),
            // then the time-based EMA (smooths what is left).
            body.shoulder = ema(
              body.shoulder,
              medianWindow(shoulderWindow, measured.shoulderWidth),
              emaAlpha,
            );
            if (measured.torsoLength !== null) {
              body.torso = ema(body.torso, medianWindow(torsoWindow, measured.torsoLength), emaAlpha);
            }
            if (measured.hipWidth !== null) {
              body.hip = ema(body.hip, medianWindow(hipWindow, measured.hipWidth), emaAlpha);
            }
          }

          updateFit(
            body.shoulder !== null
              ? {
                  shoulderWidth: body.shoulder,
                  torsoLength: body.torso,
                  hipWidth: body.hip,
                }
              : null,
          );

          for (const landmark of result.landmarks) {
            const leftShoulder = landmark[11];
            const rightShoulder = landmark[12];

            if (!leftShoulder || !rightShoulder) {
              continue;
            }

            // Low-confidence shoulders are too noisy to drive the overlay —
            // keep the last targets (the garment freezes) instead of chasing
            // them.
            const shouldersVisible =
              leftShoulder.visibility >= SHOULDER_VIS_MIN &&
              rightShoulder.visibility >= SHOULDER_VIS_MIN;

            // Feed the calibrator: shoulder span as a frame fraction, the
            // tracker's metric shoulder estimate, and how front-facing we are.
            calibrationSampleRef.current = {
              shoulderM: body.shoulder,
              shoulderFrac: Math.abs(leftShoulder.x - rightShoulder.x),
              cosYaw: Math.abs(Math.cos(garmentYaw)),
            };

            if (shirt && shouldersVisible) {
              // A fresh acquisition re-seeds the eased values so the garment
              // snaps onto the body instead of swinging in from wherever the
              // previous tracking session left it.
              if (!hadPose) {
                hadPose = true;
                posSeeded = false;
                rollSeeded = false;
                armsSeeded = false;
              }

              landmarkToWorld(leftShoulder, camera, ANCHOR_DEPTH, leftShoulderWorld);
              landmarkToWorld(rightShoulder, camera, ANCHOR_DEPTH, rightShoulderWorld);

              const leftHip = landmark[23];
              const rightHip = landmark[24];
              const hipsVisible = Boolean(
                leftHip &&
                  rightHip &&
                  leftHip.visibility >= HIP_VIS_MIN &&
                  rightHip.visibility >= HIP_VIS_MIN,
              );
              if (hipsVisible && leftHip && rightHip) {
                landmarkToWorld(leftHip, camera, ANCHOR_DEPTH, leftHipWorld);
                landmarkToWorld(rightHip, camera, ANCHOR_DEPTH, rightHipWorld);
              }

              midPoint.addVectors(leftShoulderWorld, rightShoulderWorld).multiplyScalar(0.5);

              // TARGET: scale. Real-size overlay: map real metres onto screen
              // world units so the garment keeps the dimensions it was modelled
              // at, instead of being resized to the body. `unitsPerMetre` comes
              // from the body's shoulders as they appear on screen (world
              // units) divided by the same span in metres, so it also tracks
              // camera distance.
              const projectedShoulderWidth = leftShoulderWorld.distanceTo(rightShoulderWorld);

              if (projectedShoulderWidth > 0 && body.shoulder) {
                // Screen world-units per real metre at the body's depth. Yaw
                // foreshortens the shoulder line toward nothing when the body
                // turns side-on, which used to shrink the whole garment. A
                // vertical span (shoulder-mid to hip-mid) does not foreshorten
                // with yaw, so prefer it when the hips are in frame; otherwise
                // fall back to the shoulder line folded by cos(yaw).
                const cosYaw = Math.max(Math.abs(Math.cos(garmentYaw)), 0.35);
                let unitsPerMetre = projectedShoulderWidth / (body.shoulder * cosYaw);
                if (hipsVisible && body.torso) {
                  const hipMid = anchorA
                    .addVectors(leftHipWorld, rightHipWorld)
                    .multiplyScalar(0.5);
                  const projectedTorso = midPoint.distanceTo(hipMid);
                  if (projectedTorso > 0.01) {
                    unitsPerMetre = projectedTorso / body.torso;
                  }
                }

                // Non-uniform scale driven by the outfit's real measurements:
                // width from the size's shoulder, length from its outfitLength
                // (absolute vs the model's authored span, else the real cut
                // ratio, else the generic chart). Depth follows width so the
                // cross-section stays proportional.
                const sizeMap = sizeMeasurementsRef.current;
                const widthRatio = measurementRenderFactor(
                  pickedSizeRef.current,
                  BASE_GARMENT_SIZE,
                  sizeMap,
                  "shoulder",
                  modelShoulderMeasuredRef.value ? modelShoulderWidthRef.value : null,
                );
                const lengthRatio = measurementRenderFactor(
                  pickedSizeRef.current,
                  BASE_GARMENT_SIZE,
                  sizeMap,
                  "outfitLength",
                  modelHeightMeasuredRef.value ? modelHeightRef.value : null,
                );

                const baseScale = unitsPerMetre * METERS_PER_MODEL_UNIT;

                const scaleKey = `${pickedSizeRef.current ?? "auto"}|${widthRatio.toFixed(3)}|${lengthRatio.toFixed(3)}`;
                if (scaleKey !== lastScaleKey) {
                  lastScaleKey = scaleKey;
                  console.debug("[scale]", scaleKey);
                }

                targetScaleVec.set(
                  baseScale * widthRatio,
                  baseScale * lengthRatio,
                  baseScale * widthRatio,
                );
                hasScaleTarget = true;
              }

              // TARGET: body rotation (facing + shoulder tilt).
              // Skipped while the idle test owns the bones.
              if (rootJoint && !ENABLE_IDLE_TEST) {
                // Continuous yaw from the real (metre) shoulder line: its depth
                // difference says how far the body has turned and its lateral
                // difference keeps front and back apart. Zero faces the camera,
                // +-PI/2 is side-on, +-PI is back-to-camera.
                const shoulderL = worldLandmarks[11];
                const shoulderR = worldLandmarks[12];
                if (shoulderL && shoulderR) {
                  targetYaw =
                    YAW_SIGN *
                    Math.atan2(-(shoulderR.z - shoulderL.z), -(shoulderR.x - shoulderL.x));

                  // Shoulder-line tilt, measured in 3D so it stays stable when
                  // the body is side-on: the on-screen line collapses to a
                  // point there and would otherwise roll the garment onto its
                  // side. Magnitude comes from the real shoulder vector; the
                  // sign comes from the on-screen height difference, matching
                  // the front-facing case.
                  const dy = rightShoulderWorld.y - leftShoulderWorld.y;
                  targetRoll =
                    Math.sign(dy) *
                    Math.atan2(
                      Math.abs(shoulderR.y - shoulderL.y),
                      Math.hypot(shoulderR.x - shoulderL.x, shoulderR.z - shoulderL.z),
                    );
                }
              }

              // TARGET: arm movements (only when the model actually has an arm
              // rig). Skipped while the idle test owns the bones.
              if (hasArmRig && armRest && !ENABLE_IDLE_TEST) {
                const leftElbow = landmark[13];
                const leftWrist = landmark[15];

                const rightElbow = landmark[14]; //invered
                const rightWrist = landmark[16];

                // The landmark -> world mapping flips BOTH axes (mirrored x,
                // y-up screen), so the limb's on-screen direction in model
                // space is (-dx, -dy). Measure each limb as a screen angle and
                // apply it as a delta from the captured rest pose. The same
                // maths serves both arms; the per-arm rest offsets and zSign
                // (calibrated from each bone's mirrored rest) handle the sides.
                // The solver reads arm angles off the screen, which a body yaw
                // foreshortens by cos(yaw). Divide that back out (keeping its
                // sign) so the same physical swing tracks through front, side
                // and back; the softened divisor keeps the gain finite edge-on.
                const cosYaw = Math.cos(garmentYaw);
                const stretch =
                  (cosYaw * (1 + ARM_YAW_EPS)) / (cosYaw * cosYaw + ARM_YAW_EPS);
                const solveArm = (rest: ArmCalibration, upTarget: number, foreTarget: number) => {
                  // The rest pose was captured facing the camera, so a turned
                  // body projects it mirrored (lateral scaled by cos(yaw)).
                  // Apply that same projection to the rest reference; otherwise
                  // an arm that is simply still reads as a big delta and flares.
                  const restUp = Math.atan2(
                    Math.sin(rest.upAngle),
                    Math.cos(rest.upAngle) * cosYaw,
                  );
                  const restFore = Math.atan2(
                    Math.sin(rest.foreAngle),
                    Math.cos(rest.foreAngle) * cosYaw,
                  );
                  // Both terms use the same yaw factor: the upper arm drives its
                  // own bone and the elbow is measured relative to it, so if the
                  // factor is applied to only one the forearm inverts as the
                  // body turns. `stretch` carries the sign of cos(yaw), which
                  // cancels the arm bone's local-Z axis flipping at the back.
                  const dUp = shortestAngle(upTarget - restUp) * stretch;
                  const armZ = rest.upLocalZ + rest.upZSign * dUp;
                  const dForeWorld = shortestAngle(foreTarget - restFore) * stretch - dUp;
                  const elbowZ = rest.elbowLocalZ + rest.foreZSign * dForeWorld;
                  return {armZ, elbowZ};
                };

                // Hidden limbs (out of frame, behind the body) would feed the
                // solver garbage angles, so ease that arm back to its rest pose
                // instead.
                if (
                  rightElbow.visibility >= LIMB_VIS_MIN &&
                  rightWrist.visibility >= LIMB_VIS_MIN
                ) {
                  const rightUp = Math.atan2(-(rightElbow.y - rightShoulder.y), -(rightElbow.x - rightShoulder.x));
                  const rightFore = Math.atan2(-(rightWrist.y - rightElbow.y), -(rightWrist.x - rightElbow.x));
                  const rightSolved = solveArm(armRest.right, rightUp, rightFore);
                  targetArmZR = rightSolved.armZ;
                  targetElbowZR = rightSolved.elbowZ;
                } else {
                  targetArmZR = armRest.right.upLocalZ;
                  targetElbowZR = armRest.right.elbowLocalZ;
                }

                if (
                  leftElbow.visibility >= LIMB_VIS_MIN &&
                  leftWrist.visibility >= LIMB_VIS_MIN
                ) {
                  const leftUp = Math.atan2(-(leftElbow.y - leftShoulder.y), -(leftElbow.x - leftShoulder.x));
                  const leftFore = Math.atan2(-(leftWrist.y - leftElbow.y), -(leftWrist.x - leftElbow.x));
                  const leftSolved = solveArm(armRest.left, leftUp, leftFore);
                  targetArmZL = leftSolved.armZ;
                  targetElbowZL = leftSolved.elbowZ;
                } else {
                  targetArmZL = armRest.left.upLocalZ;
                  targetElbowZL = armRest.left.elbowLocalZ;
                }

                hasArmTarget = true;
              }

              // TARGET: anchor. Measure where the shirt's shoulder line is
              // right now (after the last eased frame) and store the position
              // that lands it on the detected shoulder line. Replaces the old
              // hard-coded "-2.9" offset.
              shirt.updateMatrixWorld(true);
              if (leftShoulderBone && rightShoulderBone) {
                leftShoulderBone.getWorldPosition(anchorA);
                rightShoulderBone.getWorldPosition(anchorB);
                anchorMid.addVectors(anchorA, anchorB).multiplyScalar(0.5);
                targetShirtPos.copy(shirt.position);
                targetShirtPos.x += midPoint.x - anchorMid.x;
                targetShirtPos.y += midPoint.y - anchorMid.y + GARMENT_Y_OFFSET;
                targetShirtPos.z += midPoint.z - anchorMid.z;
              } else {
                targetShirtPos.copy(midPoint);
              }
              hasPosTarget = true;
            }

            setStatus("");
          }
        });

        animationFrameId = requestAnimationFrame(predict);
      };

      predict();
    };

    setup();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      poseLandmarker?.close();

      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      window.visualViewport?.removeEventListener("resize", resize);
      dprMedia?.removeEventListener("change", handleDprChange);

      // Remove Three.js renderer
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Three.js renderer
      renderer.dispose();
    };
  }, [modelUrl]);

  return (
    <>
      {/* Backdrop — desktop modal only; the box itself fills the screen on
          phones so there is nothing to dim. */}
      <div className="fixed inset-0 z-50 hidden bg-black/80 lg:block" aria-hidden />

      {/* Full-screen on mobile, centered 16:9 modal on desktop (lg+). All the
          absolute children below anchor to this box, so the camera canvas and
          the garment stay aligned in either layout. */}
      <div className="fixed inset-0 z-50 overflow-hidden bg-black lg:inset-auto lg:left-1/2 lg:top-1/2 lg:h-[min(85vh,52vw)] lg:aspect-video lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:shadow-2xl">
        {/* Close button */}
        <button
          onClick={() => onClose((prev) => !prev)}
          aria-label="Close AR try-on"
          className="absolute right-4 top-4 z-40 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          <X className="size-5" />
        </button>

        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          {/* Webcam */}
          <div className="absolute inset-0">
            <WebCam ref={webcamRef} onStatusChange={setStatus} />
          </div>

          {/* Three.js — hidden while calibrating so the sheet and rectangle are
              unobstructed, then faded back in. Kept laid out (opacity, not
              display) so the container size still drives the guide mapping. */}
          <div
            ref={threeContainerRef}
            className={`absolute inset-0 transition-opacity duration-200 ${
              calibrationOpen ? "opacity-0" : "opacity-100"
            }`}
          />
        </div>

        {/* Tracking status + fit chip */}
        <div className="pointer-events-none absolute left-4 top-4 z-40 flex flex-col items-start gap-2">
          {statusMessage && (
            <div className="rounded-full bg-black/70 px-3 py-1 text-sm text-white">{statusMessage}</div>
          )}

          {!calibrationOpen && fitChip && (
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white backdrop-blur-sm ${CHIP_TONES[fitChip.tone]}`}
            >
              <Shirt className="size-3.5" />
              {fitChip.label}
            </div>
          )}
        </div>

        {/* Size picker — pick a size to judge the fit against your body. Hidden
            entirely when the outfit offers no judgeable sizes. */}
        {offeredSizes.length > 0 && (
          <div className="pointer-events-auto absolute bottom-4 left-4 z-40 flex items-center gap-1 rounded-full bg-black/60 p-1 backdrop-blur-sm">
            {offeredSizes.map((size) => (
              <button
                key={size}
                onClick={() => setPickedSize(size)}
                aria-pressed={activeSize === size}
                className={sizePillClass(activeSize === size)}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {/* Fit warning */}
        {!calibrationOpen && fitToast && (
          <div
            className={`animate-[toast-in_0.18s_ease-out] pointer-events-auto absolute bottom-16 left-1/2 z-40 w-[min(92vw,26rem)] -translate-x-1/2 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md ${TOAST_TONES[fitToast.tone]}`}
          >
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 size-5 shrink-0" />
              <p className="flex-1 text-sm leading-5">{fitToast.text}</p>
              <button
                onClick={() => setFitToast(null)}
                aria-label="Dismiss fit warning"
                className="-mr-1 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* Reference calibration — corrects MediaPipe's metric scale with an A4
            sheet so the fit verdict matches a tape measure. */}
        <div className="pointer-events-auto absolute bottom-4 right-4 z-40 flex items-center gap-1 rounded-full bg-black/60 p-1 backdrop-blur-sm">
          {calibrated ? (
            <>
              <span className="px-2 text-xs text-white/80">
                Calibrated ×{calibrationFactor.toFixed(2)}
              </span>
              <button onClick={resetCalibration} className={sizePillClass(false)}>
                Reset
              </button>
            </>
          ) : (
            <button onClick={openCalibration} className={sizePillClass(false)}>
              <span className="flex items-center gap-1.5">
                <Ruler className="size-3.5" />
                Calibrate
              </span>
            </button>
          )}
        </div>

        {/* Calibration overlay: fit a landscape A4 sheet inside the rectangle. */}
        {calibrationOpen && (
          <div className="absolute inset-0 z-[45] bg-black/40">
            {/* Fixed landscape A4 rectangle the user lines their sheet up with.
                Drawn as a fraction of the camera frame so the sheet's image span
                is a known constant — no pixel measuring needed. */}
            {calibrationRect &&
              (() => {
                const rectW = A4_FRAME_FRACTION * calibrationRect.drawW;
                const rectH = rectW * A4_ASPECT;
                const left = calibrationRect.offsetX + (calibrationRect.drawW - rectW) / 2;
                const top = calibrationRect.offsetY + (calibrationRect.drawH - rectH) / 2;
                return (
                  <div
                    className="pointer-events-none absolute rounded-lg border-2 border-dashed border-cyan-300/90 bg-cyan-300/5"
                    style={{left, top, width: rectW, height: rectH}}
                  >
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-cyan-200">
                      A4 · landscape
                    </span>
                  </div>
                );
              })()}

            {/* Big centred countdown while capturing. */}
            {calibrationCountdown !== null && calibrationCountdown > 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="text-8xl font-bold tabular-nums text-white drop-shadow-lg">
                  {calibrationCountdown}
                </span>
              </div>
            )}

            <div className="pointer-events-auto absolute left-1/2 top-6 w-[min(92vw,26rem)] -translate-x-1/2 rounded-xl border border-white/15 bg-black/85 p-4 text-white backdrop-blur-md">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold">Calibrate fit with an A4 sheet</h3>
                <button
                  onClick={closeCalibration}
                  aria-label="Close calibration"
                  className="-mr-1 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                >
                  <X className="size-4" />
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-white/80">
                Hold a landscape A4 sheet flat AGAINST your chest at shoulder height — touching your
                body, not held out toward the camera — and face the camera. Step forward or back
                until the sheet&apos;s edges line up with the rectangle, then tap I&apos;m ready. The
                correction only affects the fit verdict.
              </p>

              {calibrationResult && (
                <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-sm font-semibold">
                    Correction ×{calibrationResult.factor.toFixed(2)}
                  </p>
                  {!calibrationResult.plausible && (
                    <p className="mt-2 text-xs text-amber-300">
                      That&apos;s an unusual correction — the sheet was likely held too far from your
                      chest or not fully lined up. Press it flat against your body and retry.
                    </p>
                  )}
                </div>
              )}

              {calibrationMessage && (
                <p className="mt-2 text-xs text-amber-300">{calibrationMessage}</p>
              )}
              <div className="mt-3 flex justify-end gap-2">
                {calibrationResult ? (
                  <>
                    <button
                      onClick={() => {
                        setCalibrationResult(null);
                        setCalibrationMessage("");
                      }}
                      className={sizePillClass(false)}
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => {
                        applyCalibration(calibrationResult.factor);
                        setCalibrationResult(null);
                        setCalibrationOpen(false);
                      }}
                      className={sizePillClass(false)}
                    >
                      Use correction
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={closeCalibration} className={sizePillClass(false)}>
                      Cancel
                    </button>
                    <button
                      onClick={captureCalibration}
                      disabled={calibrationCountdown !== null}
                      className={sizePillClass(false)}
                    >
                      {calibrationCountdown !== null ? "Hold still…" : "I'm ready"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
