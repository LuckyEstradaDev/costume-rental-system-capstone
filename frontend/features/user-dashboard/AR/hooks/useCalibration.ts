import {useEffect, useRef, useState} from "react";
import type {RefObject} from "react";
import {ID_CARD_FRAME_FRACTION, ID_CARD_FRAME_FRACTION_MOBILE} from "../config";
import {
  ID_CARD_LONG_EDGE_M,
  clearCalibration,
  calibrationStorageKey,
  computeCalibration,
  loadCalibration,
  stableMedian,
  saveCalibration,
  type CalibrationResult,
} from "../lib/calibration";
import {computeVideoFit} from "../lib/objectFit";
import type {CalibrationSample} from "../types";
import type {WebcamHandle} from "../components/WebCam";

/**
 * ID-card calibration: opening the overlay, the countdown, sampling the
 * shoulder span, computing the correction and persisting it. The pose loop
 * writes `sampleRef`, so this hook can read the latest pose without coupling
 * the two lifecycles.
 */
export function useCalibration(
  webcamRef: RefObject<WebcamHandle | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  wearerId?: string,
) {
  const storageKey = useRef<string | null>(null);
  const [savedFactor, setSavedFactor] = useState<number | null>(null);
  const calibrated = savedFactor !== null;
  const factor = savedFactor ?? 1;
  const factorRef = useRef(factor);
  const cardShoulderRef = useRef<number | null>(null);
  const [open, setOpen] = useState(!calibrated);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [result, setResult] = useState<CalibrationResult | null>(null);
  const [box, setBox] = useState<{w: number; h: number; vw: number; vh: number} | null>(null);
  const sampleRef = useRef<CalibrationSample>({capturedAt: 0, shoulderM: null, shoulderFrac: null, cosYaw: 0});

  function handleCameraReady(deviceId?: string) {
    storageKey.current = calibrationStorageKey(wearerId, deviceId);
    const saved = loadCalibration(storageKey.current);
    factorRef.current = saved?.factor ?? 1;
    cardShoulderRef.current = saved?.trueShoulderM ?? null;
    setSavedFactor(saved?.factor ?? null);
    setResult(null);
    setCountdown(null);
    setMessage("");
    setOpen(!saved);
  }

  const rect = box ? computeVideoFit(box.w, box.h, box.vw, box.vh) : null;
  // Portrait containers are phones; enlarge the guide so the card fills more
  // of the frame and users don't have to step back as far.
  const frameFraction =
    box && box.h > box.w ? ID_CARD_FRAME_FRACTION_MOBILE : ID_CARD_FRAME_FRACTION;

  // Keep the guide rect mapped to the container/video while the overlay is open.
  useEffect(() => {
    if (!open) return;
    const update = () => {
      const el = containerRef.current;
      const video = webcamRef.current?.video;
      if (!el) return;
      setBox((current) => {
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
    // The video size can settle late, so poll until the frame geometry is known.
    const id = window.setInterval(update, 200);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.clearInterval(id);
    };
  }, [open, containerRef, webcamRef]);

  // Countdown ticks 5→1, then ~1 s of sampling takes the median of each span.
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const id = window.setTimeout(
        () => setCountdown((current) => (current === null ? null : current - 1)),
        1000,
      );
      return () => window.clearTimeout(id);
    }

    const shoulderFracs: number[] = [];
    const shoulderMs: number[] = [];
    let lastFrameAt = performance.now();
    let ticks = 0;
    const id = window.setInterval(() => {
      if (ticks === 0) setMessage("Hold still.");
      const sample = sampleRef.current;
      if (
        sample.capturedAt > lastFrameAt &&
        sample.shoulderFrac !== null &&
        sample.shoulderM !== null &&
        sample.shoulderM > 0 &&
        sample.cosYaw > 0.95
      ) {
        lastFrameAt = sample.capturedAt;
        shoulderFracs.push(sample.shoulderFrac);
        shoulderMs.push(sample.shoulderM);
      }
      ticks += 1;
      if (ticks >= 20) {
        window.clearInterval(id);
        setCountdown(null);
        const shoulderFrac = stableMedian(shoulderFracs);
        const shoulderM = stableMedian(shoulderMs);
        // The card fills the ID-card rectangle, so its span is exactly that fraction.
        const next =
          shoulderFrac !== null && shoulderM !== null
            ? computeCalibration({
                referenceM: ID_CARD_LONG_EDGE_M,
                refFrac: frameFraction,
                shoulderFrac,
                mediapipeShoulderM: shoulderM,
              })
            : null;
        if (next === null) {
          setMessage("We need a steadier reading. Face the camera with both shoulders in view, keep the card lined up, and try again.");
        } else {
          setMessage("");
          setResult(next);
        }
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [countdown, frameFraction]);

  const openCalibration = () => {
    setMessage("");
    setCountdown(null);
    setResult(null);
    setOpen(true);
  };

  const closeCalibration = () => {
    setCountdown(null);
    setResult(null);
    setMessage("");
    setOpen(false);
  };

  const resetCalibration = () => {
    factorRef.current = 1;
    cardShoulderRef.current = null;
    setSavedFactor(null);
    clearCalibration(storageKey.current);
  };

  const captureCalibration = () => {
    if (countdown !== null) return;
    setResult(null);
    setMessage("Get ready. Hold the card steady and face the camera.");
    setCountdown(5);
  };

  const retryCalibration = () => {
    setResult(null);
    setMessage("");
  };

  const applyResult = () => {
    if (!result) return;
    cardShoulderRef.current = result.trueShoulderM;
    factorRef.current = result.factor;
    setSavedFactor(result.factor);
    saveCalibration(storageKey.current, result);
    setResult(null);
    setOpen(false);
  };

  return {
    onCameraReady: handleCameraReady,
    factor,
    factorRef,
    cardShoulderRef,
    sampleRef,
    open,
    message,
    countdown,
    result,
    rect,
    frameFraction,
    calibrated,
    openCalibration,
    closeCalibration,
    resetCalibration,
    captureCalibration,
    retryCalibration,
    applyResult,
  };
}
