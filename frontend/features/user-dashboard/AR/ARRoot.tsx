"use client";

import {useCallback, useRef, useState} from "react";
import {X} from "lucide-react";
import WebCam, {type WebcamHandle} from "./components/WebCam";
import {CalibrationButton, CalibrationPanel} from "./components/CalibrationPanel";
import {FitToast, SizePicker, TrackingHud} from "./components/Hud";
import {useARTracking} from "./hooks/useARTracking";
import {useCalibration} from "./hooks/useCalibration";
import {normalizeOutfitSizes} from "./lib/bodyFit";
import type {ARProps, FitChipState, FitToastState} from "./types";

/**
 * AR virtual try-on. Split into hooks (renderer, garment, pose, calibration)
 * and presentational components; this file only wires state and layout.
 */
export function ARRoot({modelUrl, sizes, sizeMeasurements, onClose}: ARProps) {
  const webcamRef = useRef<WebcamHandle | null>(null);
  const threeContainerRef = useRef<HTMLDivElement | null>(null);

  const [statusMessage, setStatusMessage] = useState("Starting camera...");
  const statusRef = useRef("");
  const setStatus = useCallback((message: string) => {
    if (message !== statusRef.current) {
      statusRef.current = message;
      setStatusMessage(message);
    }
  }, []);

  const [fitChip, setFitChip] = useState<FitChipState | null>(null);
  const [fitToast, setFitToast] = useState<FitToastState | null>(null);
  const [pickedSize, setPickedSize] = useState<string | null>(null);

  const offeredSizes = normalizeOutfitSizes(sizes);
  // The size in effect: the user's pick, or the first offered size by default.
  const activeSize =
    pickedSize && offeredSizes.includes(pickedSize) ? pickedSize : (offeredSizes[0] ?? null);

  const calibration = useCalibration(webcamRef, threeContainerRef);

  useARTracking({
    modelUrl,
    sizes,
    sizeMeasurements,
    pickedSize: activeSize,
    containerRef: threeContainerRef,
    webcamRef,
    calibrationFactor: calibration.factorRef,
    calibrationSample: calibration.sampleRef,
    setStatus,
    setFitChip,
    setFitToast,
  });

  return (
    <>
      {/* Desktop modal backdrop; the box fills the screen on phones. */}
      <div className="fixed inset-0 z-50 hidden bg-black/80 lg:block" aria-hidden />

      {/* Full-screen on mobile, centered 16:9 modal on desktop (lg+). */}
      <div className="fixed inset-0 z-50 overflow-hidden bg-black lg:inset-auto lg:left-1/2 lg:top-1/2 lg:h-[min(85vh,52vw)] lg:aspect-video lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:shadow-2xl">
        <button
          onClick={() => onClose((prev) => !prev)}
          aria-label="Close AR try-on"
          className="absolute right-4 top-4 z-40 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          <X className="size-5" />
        </button>

        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          <div className="absolute inset-0">
            <WebCam ref={webcamRef} onStatusChange={setStatus} />
          </div>

          {/* Three.js canvas host; faded out while calibrating so the card and
              guide stay unobstructed. Kept laid out so its size still maps. */}
          <div
            ref={threeContainerRef}
            className={`absolute inset-0 transition-opacity duration-200 ${
              calibration.open ? "opacity-0" : "opacity-100"
            }`}
          />
        </div>

        <TrackingHud statusMessage={statusMessage} fitChip={calibration.open ? null : fitChip} />

        <SizePicker sizes={offeredSizes} activeSize={activeSize} onPick={setPickedSize} />

        <FitToast
          toast={calibration.open ? null : fitToast}
          onDismiss={() => setFitToast(null)}
        />

        <CalibrationButton
          calibrated={calibration.calibrated}
          factor={calibration.factor}
          onCalibrate={calibration.openCalibration}
          onReset={calibration.resetCalibration}
        />

        {calibration.open && (
          <CalibrationPanel
            rect={calibration.rect}
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
