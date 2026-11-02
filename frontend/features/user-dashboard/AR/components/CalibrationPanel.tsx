import {Ruler, X} from "lucide-react";
import {ID_CARD_ASPECT, ID_CARD_FRAME_FRACTION} from "../config";
import type {CalibrationResult} from "../lib/calibration";
import type {VideoFitRect} from "../lib/objectFit";
import {sizePillClass} from "./tones";

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
    <div className="pointer-events-auto absolute bottom-4 right-4 z-40 flex items-center gap-1 rounded-full bg-black/60 p-1 backdrop-blur-sm">
      {calibrated ? (
        <>
          <span className="px-2 text-xs text-white/80">Calibrated ×{factor.toFixed(2)}</span>
          <button onClick={onReset} className={sizePillClass(false)}>
            Reset
          </button>
        </>
      ) : (
        <button onClick={onCalibrate} className={sizePillClass(false)}>
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
  countdown,
  result,
  message,
  onCapture,
  onClose,
  onRetry,
  onApply,
}: {
  rect: VideoFitRect | null;
  countdown: number | null;
  result: CalibrationResult | null;
  message: string;
  onCapture: () => void;
  onClose: () => void;
  onRetry: () => void;
  onApply: () => void;
}) {
  return (
    <div className="absolute inset-0 z-[45] bg-black/40">
      {/* Guide rectangle, drawn as a fraction of the camera frame so the card's
          image span is a known constant. */}
      {rect &&
        (() => {
          const rectW = ID_CARD_FRAME_FRACTION * rect.drawW;
          const rectH = rectW * ID_CARD_ASPECT;
          const left = rect.offsetX + (rect.drawW - rectW) / 2;
          const top = rect.offsetY + (rect.drawH - rectH) / 2;
          return (
            <div
              className="pointer-events-none absolute rounded-lg border-2 border-dashed border-cyan-300/90 bg-cyan-300/5"
              style={{left, top, width: rectW, height: rectH}}
            >
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-cyan-200">
                ID card
              </span>
            </div>
          );
        })()}

      {countdown !== null && countdown > 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-8xl font-bold tabular-nums text-white drop-shadow-lg">
            {countdown}
          </span>
        </div>
      )}

      <div className="pointer-events-auto absolute left-1/2 top-6 w-[min(92vw,26rem)] -translate-x-1/2 rounded-xl border border-white/15 bg-black/85 p-4 text-white backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold">Calibrate fit with an ID card</h3>
          <button
            onClick={onClose}
            aria-label="Close calibration"
            className="-mr-1 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-2 text-xs leading-5 text-white/80">
          Hold a landscape ID card (credit card, driver&apos;s license, or any similar card,
          3.375 × 2.125 in) flat AGAINST your chest at shoulder height — touching your body,
          not held out toward the camera — and face the camera. Step forward or back until
          the card&apos;s edges line up with the rectangle, then tap I&apos;m ready. The
          correction only affects the fit verdict.
        </p>

        {result && (
          <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-sm font-semibold">Correction ×{result.factor.toFixed(2)}</p>
            {!result.plausible && (
              <p className="mt-2 text-xs text-amber-300">
                That&apos;s an unusual correction — the card was likely held too far from your
                chest or not fully lined up. Press it flat against your body and retry.
              </p>
            )}
          </div>
        )}

        {message && <p className="mt-2 text-xs text-amber-300">{message}</p>}

        <div className="mt-3 flex justify-end gap-2">
          {result ? (
            <>
              <button onClick={onRetry} className={sizePillClass(false)}>
                Retry
              </button>
              <button onClick={onApply} className={sizePillClass(false)}>
                Use correction
              </button>
            </>
          ) : (
            <>
              <button onClick={onClose} className={sizePillClass(false)}>
                Cancel
              </button>
              <button
                onClick={onCapture}
                disabled={countdown !== null}
                className={sizePillClass(false)}
              >
                {countdown !== null ? "Hold still…" : "I'm ready"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
