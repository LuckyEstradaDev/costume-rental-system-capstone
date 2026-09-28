"use client";

import type {ReactNode} from "react";
import {CalendarRange, RotateCcw} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {formatReadableDate} from "@/lib/formatters";
import {DateWindowSlicer} from "./DateWindowSlicer";
import {presetLabel} from "../../hooks/useDateWindow";
import type {DateRange, WindowPresetId} from "../../types/filters";

interface DateRangeDropdownProps {
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
  /** Extra controls above the reset action, e.g. the dashboard's bucket size. */
  children?: ReactNode;
}

/**
 * A collapsed trigger reporting the active window, expanding into a panel of
 * presets plus a custom start/end. Edits apply live, so there is no confirm
 * step and the panel stays open.
 */
export function DateRangeDropdown({
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
}: DateRangeDropdownProps) {
  const summary =
    presetId === "custom"
      ? `${formatReadableDate(range.from)} – ${formatReadableDate(range.to)}`
      : presetLabel(presetId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CalendarRange className="size-4" />
          {summary}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 space-y-4">
        <DateWindowSlicer
          presetId={presetId}
          customFrom={customFrom}
          customTo={customTo}
          onPresetChange={onPresetChange}
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
