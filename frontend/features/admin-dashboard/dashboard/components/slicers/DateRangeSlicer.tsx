"use client";

import type {ReactNode} from "react";
import {CalendarRange, ChevronDown, RotateCcw} from "lucide-react";

import {Button} from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {AdminSegmented} from "@/features/admin-dashboard/components/AdminSegmented";
import {formatReadableDate} from "@/lib/formatters";
import {WINDOW_PRESETS} from "../../utils/dateRange";
import {CustomRangeInputs} from "./CustomRangeInputs";
import {presetLabel} from "../../hooks/useDateWindow";
import type {DateRange, WindowPresetId} from "../../types/filters";

interface DateRangeSlicerProps {
  presetId: WindowPresetId;
  range: DateRange;
  customFrom: Date;
  customTo: Date;
  isDefault: boolean;
  /** The preset `onReset` returns to; also names the reset action. */
  defaultPreset: WindowPresetId;
  onPresetChange: (preset: WindowPresetId) => void;
  onCustomFromChange: (value: string, fallback: Date) => void;
  onCustomToChange: (value: string, fallback: Date) => void;
  onReset: () => void;
  /** Extra controls, e.g. the dashboard's bucket size. Rendered above the reset. */
  children?: ReactNode;
}

/**
 * The date-window control, collapsed to a chip that reports the active window
 * and expands into the full set of controls.
 *
 * The chip is `fixed` to the top right of the tab body rather than docked in
 * the header, so the filter never competes with the page title for the bar's
 * single line. The offsets are baked in here instead of being repeated on every
 * page that renders it, and since `fixed` takes the chip out of layout the pages
 * only have to reserve a lane for it with `pt-10`.
 *
 * The chip is still a DOM child of the page root, so the page's `space-y-6`
 * treats it as a sibling and adds its own margin to whatever follows. That
 * stacks with `pt-10`, which is why the gap under the chip is roomier than the
 * gap above it; dial `pt-10` down if you want them even.
 *
 * `top-[calc(var(--admin-header-height,4.5rem)+1rem)]` clears the bar by 1rem.
 * It reads the bar's measured height rather than a constant because the bar is
 * auto-height - a page description under the title changes it - and a chip
 * pinned to a hardcoded offset would slide under the taller pages. The
 * `right` offsets line the chip up with the content column's own padding, and
 * the column already carries the `md:ml-72` that clears the sidebar. The chip
 * sits at `z-20`, above page content but below the header, and the panel is
 * `z-50` by virtue of the popover portal, so it opens over everything.
 *
 * Edits apply live, so there is no confirm step and the panel stays open while
 * the window is adjusted.
 */
export function DateRangeSlicer({
  presetId,
  range,
  customFrom,
  customTo,
  isDefault,
  defaultPreset,
  onPresetChange,
  onCustomFromChange,
  onCustomToChange,
  onReset,
  children,
}: DateRangeSlicerProps) {
  const summary =
    presetId === "custom"
      ? `${formatReadableDate(range.from)} – ${formatReadableDate(range.to)}`
      : presetLabel(presetId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="group fixed right-4 top-[calc(var(--admin-header-height,4.5rem)+1rem)] z-20 max-w-40 gap-2 border border-border bg-background px-2 font-semibold shadow-sm md:right-6 sm:max-w-none sm:px-3"
        >
          <CalendarRange className="size-4 shrink-0" />
          <span className="truncate">{summary}</span>
          <ChevronDown className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" side="bottom" className="w-80 space-y-4">
        <AdminSegmented
          size="sm"
          variant="pills"
          aria-label="Date window"
          className="flex-wrap"
          value={presetId}
          onValueChange={onPresetChange}
          options={WINDOW_PRESETS.filter((preset) => preset.id !== "custom").map(
            (preset) => ({
              value: preset.id,
              label: preset.id === "all" ? "All time" : preset.label,
            }),
          )}
        />

        <CustomRangeInputs
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={onCustomFromChange}
          onCustomToChange={onCustomToChange}
        />

        {children ? (
          <div className="space-y-2 border-t pt-4">{children}</div>
        ) : null}

        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={isDefault}
          className="w-full gap-2"
        >
          <RotateCcw className="size-4" />
          Reset to {presetLabel(defaultPreset).toLowerCase()}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
