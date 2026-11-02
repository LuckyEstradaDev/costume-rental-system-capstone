import {Shirt, TriangleAlert, X} from "lucide-react";
import {FIT_CRITERION_KEYS, type FitCriterionKey} from "../lib/bodyFit";
import type {FitChipState, FitToastState} from "../types";
import {CHIP_TONES, TOAST_TONES, sizePillClass} from "./tones";

const CRITERION_LABELS: Record<FitCriterionKey, string> = {
  shoulder: "Shoulder",
  chest: "Chest",
  sleeve: "Sleeve",
  length: "Length",
};

/** Top-left status line and the always-on fit chips. */
export function TrackingHud({
  statusMessage,
  fitChips,
}: {
  statusMessage: string;
  fitChips: FitChipState[] | null;
}) {
  return (
    <div className="pointer-events-none absolute left-4 top-4 z-40 flex flex-col items-start gap-2">
      {statusMessage && (
        <div className="rounded-full bg-black/70 px-3 py-1 text-sm text-white">{statusMessage}</div>
      )}

      {fitChips?.map((chip) => (
        <div
          key={chip.key}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white backdrop-blur-sm ${CHIP_TONES[chip.tone]}`}
        >
          <Shirt className="size-3.5" />
          {chip.label}
        </div>
      ))}
    </div>
  );
}

/** Bottom-left size buttons; hidden when the outfit offers no sizes. */
export function SizePicker({
  sizes,
  activeSize,
  onPick,
}: {
  sizes: string[];
  activeSize: string | null;
  onPick: (size: string) => void;
}) {
  if (sizes.length === 0) return null;

  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 z-40 flex items-center gap-1 rounded-full bg-black/60 p-1 backdrop-blur-sm">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => onPick(size)}
          aria-pressed={activeSize === size}
          className={sizePillClass(activeSize === size)}
        >
          {size}
        </button>
      ))}
    </div>
  );
}

/** Chooses which criterion's detailed fit warning is shown. */
export function CriterionSelect({
  selected,
  onSelect,
}: {
  selected: FitCriterionKey;
  onSelect: (criterion: FitCriterionKey) => void;
}) {
  return (
    <label className="pointer-events-auto absolute bottom-16 left-4 z-40 flex items-center gap-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
      <span className="pl-1 text-[10px] font-medium uppercase tracking-wide text-white/60">
        Fit warning
      </span>
      <select
        value={selected}
        onChange={(event) => {
          const criterion = FIT_CRITERION_KEYS.find((key) => key === event.target.value);
          if (criterion) onSelect(criterion);
        }}
        aria-label="Fit warning criterion"
        className="rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-white outline-none"
      >
        {FIT_CRITERION_KEYS.map((criterion) => (
          <option key={criterion} value={criterion} className="bg-neutral-900 text-white">
            {CRITERION_LABELS[criterion]}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Dismissible fit warning banner. */
export function FitToast({toast, onDismiss}: {toast: FitToastState | null; onDismiss: () => void}) {
  if (!toast) return null;

  return (
    <div
      className={`animate-[toast-in_0.18s_ease-out] pointer-events-auto absolute bottom-32 left-1/2 z-40 w-[min(92vw,26rem)] -translate-x-1/2 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md ${TOAST_TONES[toast.tone]}`}
    >
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0" />
        <p className="flex-1 text-sm leading-5">{toast.text}</p>
        <button
          onClick={onDismiss}
          aria-label="Dismiss fit warning"
          className="-mr-1 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
