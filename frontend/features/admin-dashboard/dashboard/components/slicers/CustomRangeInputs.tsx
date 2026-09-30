"use client";

import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {toDateInputValue} from "../../utils/dateRange";

interface CustomRangeInputsProps {
  customFrom: Date;
  customTo: Date;
  onCustomFromChange: (value: string, fallback: Date) => void;
  onCustomToChange: (value: string, fallback: Date) => void;
}

/**
 * The custom start/end pair, split out of the preset control so the docked
 * slicer can keep the presets on the header's single line and reveal only these
 * two inputs on demand.
 *
 * Native `<input type="date">`, so the project picks up no new dependency.
 * Each input is bounded by the other, which is what stops a reversed range from
 * being typed in the first place.
 */
export function CustomRangeInputs({
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}: CustomRangeInputsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
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
  );
}
