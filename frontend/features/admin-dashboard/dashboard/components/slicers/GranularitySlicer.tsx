"use client";

import {Button} from "@/components/ui/button";
import {
  GRANULARITIES,
  GRANULARITY_LABELS,
  type Granularity as GranularityType,
} from "../../types/filters";
import {isGranularityUsable} from "../../utils/dateRange";
import type {DateRange} from "../../types/filters";

interface GranularitySlicerProps {
  value: GranularityType;
  range: DateRange;
  onChange: (granularity: GranularityType) => void;
}

/**
 * Bucket-size control, kept separate from the window because they answer
 * different questions: the window chooses *which* rows, this chooses how they
 * are grouped for display.
 *
 * Options that would render more points than the charts can usefully show are
 * disabled, and the caller renders `value` (the resolved fallback) so the
 * control always reflects what is actually drawn.
 */
export function GranularitySlicer({
  value,
  range,
  onChange,
}: GranularitySlicerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {GRANULARITIES.map((granularity) => {
        const disabled = !isGranularityUsable(range, granularity);
        const label = GRANULARITY_LABELS[granularity].toLowerCase();

        return (
          <Button
            key={granularity}
            size="sm"
            variant={granularity === value ? "secondary" : "outline"}
            disabled={disabled}
            onClick={() => onChange(granularity)}
            title={
              disabled
                ? `Too many ${label} points for this range — pick a shorter range or a coarser group`
                : `Group by ${label}`
            }
          >
            {GRANULARITY_LABELS[granularity]}
          </Button>
        );
      })}
    </div>
  );
}
