"use client";

import {useCallback, useMemo, useRef, useState} from "react";
import {X} from "lucide-react";
import WebCam, {type WebcamHandle} from "./components/WebCam";
import {CalibrationButton, CalibrationPanel} from "./components/CalibrationPanel";
import {MeasurementCapture} from "./components/MeasurementCapture";
import {CriterionSelect, FitToast, SizePicker, TrackingHud} from "./components/Hud";
import {AR_FOCUS} from "./components/tones";
import {useARTracking} from "./hooks/useARTracking";
import {useCalibration} from "./hooks/useCalibration";
import {
  FIT_CRITERION_KEYS,
  evaluateFit,
  isLongCutCategory,
  normalizeOutfitSizes,
  type FitCriterionKey,
} from "./lib/bodyFit";
import type {ARProps} from "./types";
import type {AcceptedCapture, MeasurementRequest} from "./lib/measurementCapture";

/**
 * AR virtual try-on. Split into hooks (renderer, garment, pose, calibration)
 * and presentational components; this file only wires state and layout.
 */
export function ARRoot({modelUrl, sizes, sizeMeasurements, category, onClose, wearerId}: ARProps) {
  const webcamRef = useRef<WebcamHandle | null>(null);
  const threeContainerRef = useRef<HTMLDivElement | null>(null);
  const poseDebugRef = useRef<HTMLCanvasElement | null>(null);
  const measurementRequest = useRef<MeasurementRequest | null>(null);
  const [cameraSession, setCameraSession] = useState(0);

  const [statusMessage, setStatusMessage] = useState("Starting camera...");
  const statusRef = useRef("");
  const setStatus = useCallback((message: string) => {
    if (message !== statusRef.current) {
      statusRef.current = message;
      setStatusMessage(message);
    }
  }, []);

  const [accepted, setAccepted] = useState<AcceptedCapture | null>(null);
  const [dismissedWarning, setDismissedWarning] = useState<string | null>(null);
  const [pickedSize, setPickedSize] = useState<string | null>(null);
  const [selectedCriterion, setSelectedCriterion] = useState<FitCriterionKey>("shoulder");

  const offeredSizes = normalizeOutfitSizes(sizes);
  const manualSize = pickedSize && offeredSizes.includes(pickedSize) ? pickedSize : null;

  const calibration = useCalibration(webcamRef, threeContainerRef, wearerId);
  const measuring = calibration.open;
  const tryingOn = calibration.calibrated && !measuring && accepted !== null;
  const fit = useMemo(() => tryingOn && accepted
    ? evaluateFit(accepted.values.body, null, manualSize, sizes, sizeMeasurements, category, accepted.waistInches)
    : null, [tryingOn, accepted, manualSize, sizes, sizeMeasurements, category]);
  const activeSize = manualSize ?? fit?.size ?? null;
  const warning = fit?.criteria.find((criterion) => criterion.key === selectedCriterion);
  const fitToast = warning?.detail && warning.detail !== dismissedWarning && (warning.tone === "red" || warning.tone === "amber")
    ? {text: warning.detail, tone: warning.tone}
    : null;

  function beginMeasurement() {
    setAccepted(null);
    setPickedSize(null);
    setDismissedWarning(null);
  }

  const criterionOptions: readonly FitCriterionKey[] = isLongCutCategory(category)
    ? FIT_CRITERION_KEYS.filter((key) => key === "shoulder" || key === "waist")
    : FIT_CRITERION_KEYS;

  useARTracking({
    measurementRequest,
    modelUrl,

    containerRef: threeContainerRef,
    webcamRef,
    poseDebugRef,
    calibrationFactor: calibration.factorRef,
    cardShoulderRef: calibration.cardShoulderRef,
    calibrationSample: calibration.sampleRef,
    setStatus,
  });

  return (
    <>
      {/* Desktop modal backdrop; the box fills the screen on phones. */}
      <div className="fixed inset-0 z-50 hidden bg-black/80 lg:block" aria-hidden />

      {/* Full-screen on mobile, centered 16:9 modal on desktop (lg+). */}
      <div className="fixed inset-0 z-50 overflow-hidden bg-black lg:inset-auto lg:left-1/2 lg:top-1/2 lg:h-[min(85vh,52vw)] lg:aspect-video lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-xl lg:shadow-2xl lg:ring-1 lg:ring-white/10">
        <button
          onClick={() => onClose((prev) => !prev)}
          aria-label="Close AR try-on"
          className={`absolute right-4 top-4 z-40 flex size-10 items-center justify-center rounded-lg border border-white/10 bg-black/55 text-white shadow-lg transition-colors hover:bg-primary hover:text-primary-foreground ${AR_FOCUS}`}
        >
          <X className="size-5" />
        </button>

        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          <div className="absolute inset-0">
            <WebCam ref={webcamRef} onStatusChange={setStatus} onCameraReady={(deviceId) => {
              measurementRequest.current = null;
              beginMeasurement();
              setCameraSession((session) => session + 1);

              calibration.onCameraReady(deviceId);
            }} />
          </div>

          {/* Three.js canvas host; faded out while calibrating so the card and
              guide stay unobstructed. Kept laid out so its size still maps. */}
          <div
            ref={threeContainerRef}
            className={`absolute inset-0 transition-opacity duration-200 ${
              tryingOn ? "opacity-100" : "invisible opacity-0"
            }`}
          />

          {/* Debug overlay: MediaPipe landmarks, connectors and live measurements. */}
          <canvas
            ref={poseDebugRef}
            hidden={tryingOn}
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{zIndex: 30}}
          />
        </div>

        <TrackingHud statusMessage={statusMessage} fitChips={fit?.criteria ?? null} />

        {tryingOn && <SizePicker sizes={offeredSizes} activeSize={activeSize} automatic={!manualSize}
          onPick={(size) => { setDismissedWarning(null); setPickedSize(size === manualSize ? null : size); }} />}

        {tryingOn && (
          <CriterionSelect
            selected={selectedCriterion}
            onSelect={(criterion) => { setDismissedWarning(null); setSelectedCriterion(criterion); }}
            options={criterionOptions}
          />
        )}

        <FitToast
          toast={fitToast}
          onDismiss={() => setDismissedWarning(fitToast?.text ?? null)}
        />

        {!measuring && <CalibrationButton
          calibrated={calibration.calibrated}
          factor={calibration.factor}
          onCalibrate={calibration.openCalibration}
          onReset={() => {
            beginMeasurement();

            calibration.resetCalibration();
            calibration.openCalibration();
          }}
        />}

        {!measuring && calibration.calibrated && (
          <div className="absolute bottom-16 right-4 z-40 flex flex-col items-end gap-2">
            <MeasurementCapture key={cameraSession} requestRef={measurementRequest} accepted={accepted} onAccept={setAccepted} onRetake={beginMeasurement} />
          </div>
        )}
        {calibration.open && (
          <CalibrationPanel
            rect={calibration.rect}
            frameFraction={calibration.frameFraction}
            countdown={calibration.countdown}
            result={calibration.result}
            message={calibration.message}
            onCapture={calibration.captureCalibration}
            onClose={calibration.closeCalibration}
            onRetry={calibration.retryCalibration}
            onApply={calibration.applyResult}
          />
        )}
      </div>
    </>
  );
}
