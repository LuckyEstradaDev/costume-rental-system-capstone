import type {FitTone} from "../types";

/** Background classes for the fit chip, by verdict tone. */
export const CHIP_TONES: Record<FitTone, string> = {
  green: "bg-emerald-600/85",
  amber: "bg-amber-600/85",
  red: "bg-red-600/85",
};

/** Container classes for the fit warning toast. */
export const TOAST_TONES = {
  red: "border-red-500/50 bg-red-950/85 text-red-100 [&_svg]:text-red-400",
  amber: "border-amber-500/50 bg-amber-950/85 text-amber-100 [&_svg]:text-amber-400",
};

/** Shared pill styling used by the size and calibration buttons. */
export const sizePillClass = (active: boolean) =>
  `rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
    active ? "bg-white text-black" : "text-white/70 hover:bg-white/10 hover:text-white"
  }`;
