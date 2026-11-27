import {Ruler, X} from "lucide-react";
import {ID_CARD_ASPECT} from "../config";
import type {CalibrationResult} from "../lib/calibration";
import type {VideoFitRect} from "../lib/objectFit";
import {AR_FOCUS, AR_PANEL, AR_SURFACE, actionButtonClass} from "./tones";

function explainMeasurementScale(factor: number): string {
  if (factor === 1) {
    return "The camera and card give the same shoulder width. Your fit check can use the original measurements.";
  }

  const percent = Math.abs(Math.round(factor * 100) - 100);
  if (percent === 0) {
    return "The camera and card give nearly the same shoulder width. Your measurements will change by less than 1%.";
  }

  const direction = factor > 1 ? "larger" : "smaller";
  return `Using the card as a guide, your fit check will use measurements about ${percent}% ${direction} than the camera originally estimated.`;
}

/** Bottom-right trigger: shows the saved correction, or asks the user to calibrate. */
export function CalibrationButton({
  calibrated,
  factor,
  onCalibrate,
  onReset,
}: {
  calibrated: boolean;
  factor: number;
  onCalibrate: () => void;
  onReset: () => void;
}) {
  return (
    <div
      className={`pointer-events-auto absolute bottom-4 right-4 z-40 flex items-center gap-1 rounded-xl p-1 ${AR_SURFACE}`}
    >
      {calibrated ? (
        <>
          <span className="px-2 text-xs text-white/75" title={explainMeasurementScale(factor)}>
            Fit scale {Math.round(factor * 100)}%
          </span>
          <button onClick={onReset} className={actionButtonClass("neutral")}>
            Reset
          </button>
        </>
      ) : (
        <button onClick={onCalibrate} className={actionButtonClass("primary")}>
          <span className="flex items-center gap-1.5">
            <Ruler className="size-3.5" />
            Calibrate
          </span>
        </button>
      )}
    </div>
  );
}

/** Full calibration overlay: card guide, countdown, result and actions. */
export function CalibrationPanel({
  rect,
  frameFraction,
  countdown,
  result,
  message,
  onCapture,
  onClose,
  onRetry,
  onApply,
}: {
  rect: VideoFitRect | null;
  frameFraction: number;
  countdown: number | null;
  result: CalibrationResult | null;
  message: string;
  onCapture: () => void;
  onClose: () => void;
  onRetry: () => void;
  onApply: () => void;
}) {
  const capturing = countdown !== null;
  return (
    <div className="absolute inset-0 z-[45]">
      {/* Guide rectangle, drawn as a fraction of the camera frame so the card's
          image span is a known constant. */}
      {rect &&
        (() => {
          const rectW = frameFraction * rect.drawW;
          const rectH = rectW * ID_CARD_ASPECT;
          const left = rect.offsetX + (rect.drawW - rectW) / 2;
          const top = rect.offsetY + (rect.drawH - rectH) / 2;
          return (
            <div
              className="pointer-events-none absolute rounded-lg border-2 border-dashed border-emerald-400 shadow-sm shadow-black/70"
              style={{left, top, width: rectW, height: rectH}}
            >
              <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-emerald-950 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-emerald-300">
                ID card
              </span>
            </div>
          );
        })()}

      {capturing && (
        <>
          <div role="status" className="pointer-events-none absolute left-1/2 z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/70 px-3 py-1 font-bold tabular-nums text-emerald-300"
            style={{top: rect ? rect.offsetY + (rect.drawH + frameFraction * rect.drawW * ID_CARD_ASPECT) / 2 : "65%"}}>
            {countdown > 0 ? <span className="text-5xl">{countdown}</span> : "Hold still"}
          </div>
          <button onClick={onClose} className={`absolute bottom-4 right-4 bg-black/80 text-white ${actionButtonClass("neutral")}`}>Cancel</button>
        </>
      )}

      <div hidden={capturing} className={`pointer-events-auto absolute left-1/2 top-6 w-[min(92vw,26rem)] -translate-x-1/2 p-4 text-white ${AR_PANEL}`}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold">Calibrate fit with an ID card</h3>
          <button
            onClick={onClose}
            aria-label="Close calibration"
            className={`-mr-1 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-white/10 ${AR_FOCUS}`}
          >
            <X className="size-4" />
          </button>
        </div>
        {!result && (
          <p className="mt-2 text-base leading-relaxed text-white/80">
            A standard ID or bank card has a known width. We use it like a ruler to estimate
            your shoulder width. Face the camera and hold the card sideways, flat against your
            upper chest. Step forward or back until its edges match the guide, then tap I&apos;m ready.
            Ideally the camera is already close to 100%, which means it needs little adjustment.
            If the card lines up, use the result even when it is higher or lower.
          </p>
        )}

        {result && (
          <div role="status" className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-base font-semibold">Measurement scale {Math.round(result.factor * 100)}%</p>
            <p className="mt-2 text-base leading-relaxed text-white/80">
              {explainMeasurementScale(result.factor)}
            </p>
            {!result.plausible && (
              <p className="mt-2 text-base leading-relaxed text-amber-300">
                That&apos;s a large adjustment. Tap Retry to check again, keeping the card flat
                against your upper chest and lined up with the guide.
              </p>
            )}
          </div>
        )}

        {message && <p className="mt-2 text-base leading-5 text-amber-300">{message}</p>}

        <div className="mt-3 flex justify-end gap-2">
          {result ? (
            <>
              <button onClick={onRetry} className={actionButtonClass("neutral")}>
                Retry
              </button>
              <button onClick={onApply} className={actionButtonClass("primary")}>
                Continue to body measurement
              </button>
            </>
          ) : (
            <>
              <button onClick={onClose} className={actionButtonClass("neutral")}>
                Cancel
              </button>
              <button
                onClick={onCapture}
                disabled={countdown !== null}
                className={actionButtonClass("primary")}
              >
                {countdown !== null ? "Hold still." : "I'm ready"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
