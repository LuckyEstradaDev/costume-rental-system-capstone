/**
 * The one sizing rule for the app's pill toggles.
 *
 * On a phone these controls are the widest thing on the page: a five-option
 * status filter and a three-option view switch both overrun a 360px viewport
 * if their buttons keep their desktop padding, and the row then has to scroll
 * sideways. Below `sm` the buttons shrink and drop their leading icon - the
 * label already names the option - so every toggle fits its row without the
 * row scrolling. From `sm` up nothing changes.
 *
 * The track is capped at its container and allowed to wrap, so a row that
 * still cannot fit (a five-option filter on a 320px phone) folds onto a
 * second line instead of pushing the page sideways.
 */
export const SEGMENTED_TRACK_CLASS =
  "relative flex max-w-full flex-wrap gap-1 rounded-full border border-border bg-muted/30 p-1";

export const SEGMENTED_BUTTON_CLASS =
  "flex shrink-0 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm";

/** The leading mark. Hidden on phones, where the label carries the meaning. */
export const SEGMENTED_ICON_CLASS = "hidden shrink-0 sm:block sm:size-4";

export const SEGMENTED_COUNT_CLASS = "tabular-nums text-[10px] sm:text-[11px]";
