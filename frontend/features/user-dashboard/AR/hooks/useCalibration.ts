import {useEffect, useRef, useState} from "react";
import type {RefObject} from "react";
import {ID_CARD_FRAME_FRACTION, ID_CARD_FRAME_FRACTION_MOBILE} from "../config";
import {
  ID_CARD_LONG_EDGE_M,
  clearCalibration,
  computeCalibration,
  loadCalibration,
  median,
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
) {
  const [factor, setFactor] = useState(() => loadCalibration()?.factor ?? 1);
  const factorRef = useRef(factor);
  const [open, setOpen] = useState(() => loadCalibration() === null);
  const [message, setMessage] = useState(() =>
    loadCalibration() === null
      ? "First, calibrate with an ID card so the fit verdict is accurate."
      : "",
  );
  const [countdown, setCountdown] = useState<number | null>(null);
  const [result, setResult] = useState<CalibrationResult | null>(null);
  const [box, setBox] = useState<{w: number; h: number; vw: number; vh: number} | null>(null);
  const sampleRef = useRef<CalibrationSample>({shoulderM: null, shoulderFrac: null, cosYaw: 0});

  const rect = box ? computeVideoFit(box.w, box.h, box.vw, box.vh) : null;
  // Portrait containers are phones; enlarge the guide so the card fills more
  // of the frame and users don't have to step back as far.
  const frameFraction =
    box && box.h > box.w ? ID_CARD_FRAME_FRACTION_MOBILE : ID_CARD_FRAME_FRACTION;
  const calibrated = factor !== 1;

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
    let ticks = 0;
    const id = window.setInterval(() => {
      if (ticks === 0) setMessage("Hold still.");
      const sample = sampleRef.current;
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
        setCountdown(null);
        const shoulderFrac = median(shoulderFracs);
        const shoulderM = median(shoulderMs);
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
          setMessage("Couldn't calibrate. Face the camera, hold the card steady, and try again.");
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

  const applyCalibration = (value: number) => {
    factorRef.current = value;
    setFactor(value);
    saveCalibration(value);
  };

  const resetCalibration = () => {
    factorRef.current = 1;
    setFactor(1);
    clearCalibration();
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
    applyCalibration(result.factor);
    setResult(null);
    setOpen(false);
  };

  return {
    factor,
    factorRef,
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
