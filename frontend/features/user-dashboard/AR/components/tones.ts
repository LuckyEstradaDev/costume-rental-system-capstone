import type {FitTone} from "../types";

/** Shared focus treatment for AR controls over video. */
export const AR_FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

/** Shared translucent HUD surface. Pair with a radius utility. */
export const AR_SURFACE = "border border-white/10 bg-black/55 shadow-lg backdrop-blur-md";

/** Floating panel surface, matching the dashboard card radius. */
export const AR_PANEL = "rounded-xl border border-white/10 bg-black/80 shadow-2xl backdrop-blur-md";

/** Background and border classes for the fit chip, by verdict tone. */
export const CHIP_TONES: Record<FitTone, string> = {
  green: "border-emerald-400/30 bg-emerald-600/90",
  amber: "border-amber-400/30 bg-amber-600/90",
  red: "border-red-400/30 bg-red-600/90",
  neutral: "border-white/10 bg-slate-600/90",
};

/** Container classes for the fit warning toast. */
export const TOAST_TONES = {
  red: "border-red-500/50 bg-red-950/90 text-red-100 [&_svg]:text-red-400",
  amber: "border-amber-500/50 bg-amber-950/90 text-amber-100 [&_svg]:text-amber-400",
};

/** Shared button styling for size choices and secondary calibration actions. */
export const sizePillClass = (active: boolean) =>
  `rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${AR_FOCUS} ${
    active
      ? "bg-primary text-primary-foreground shadow-sm"
      : "text-white/70 hover:bg-white/10 hover:text-white"
  }`;

/** Calibration action button, optionally using the primary brand treatment. */
export const actionButtonClass = (emphasis: "primary" | "neutral" = "neutral") =>
  `rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${AR_FOCUS} ${
    emphasis === "primary"
      ? "border-primary bg-primary text-primary-foreground hover:bg-primary/85"
      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
  }`;
