"use client";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {WINDOW_PRESETS, toDateInputValue} from "../../utils/dateRange";
import type {WindowPresetId} from "../../types/filters";

interface DateWindowSlicerProps {
  presetId: WindowPresetId;
  customFrom: Date;
  customTo: Date;
  onPresetChange: (preset: WindowPresetId) => void;
  onCustomFromChange: (value: string, fallback: Date) => void;
  onCustomToChange: (value: string, fallback: Date) => void;
}

const isCustom = (id: WindowPresetId) => id === "custom";

/**
 * Preset buttons plus a custom start/end range, using native
 * `<input type="date">` so the project picks up no new dependency.
 */
export function DateWindowSlicer({
  presetId,
  customFrom,
  customTo,
  onPresetChange,
  onCustomFromChange,
  onCustomToChange,
}: DateWindowSlicerProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {WINDOW_PRESETS.filter((preset) => !isCustom(preset.id)).map((preset) => (
          <Button
            key={preset.id}
            size="sm"
            variant={presetId === preset.id ? "secondary" : "outline"}
            onClick={() => onPresetChange(preset.id)}
          >
            {preset.id === "all" ? "All time" : preset.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t pt-3">
        <div className="space-y-1.5">
          <Label htmlFor="slicer-from" className="text-xs text-muted-foreground">
            From
          </Label>
          <Input
            id="slicer-from"
            type="date"
            value={toDateInputValue(customFrom)}
            max={toDateInputValue(customTo)}
            onChange={(event) =>
              onCustomFromChange(event.target.value, customFrom)
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slicer-to" className="text-xs text-muted-foreground">
            To
          </Label>
          <Input
            id="slicer-to"
            type="date"
            value={toDateInputValue(customTo)}
            min={toDateInputValue(customFrom)}
            onChange={(event) => onCustomToChange(event.target.value, customTo)}
          />
        </div>
      </div>
    </div>
  );
}
