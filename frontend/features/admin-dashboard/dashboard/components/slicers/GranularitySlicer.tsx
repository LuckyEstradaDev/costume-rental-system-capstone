"use client";

import {
  GRANULARITIES,
  GRANULARITY_LABELS,
  type Granularity as GranularityType,
} from "../../types/filters";
import {AdminSegmented} from "@/features/admin-dashboard/components/AdminSegmented";
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
    <AdminSegmented
      size="sm"
      variant="pills"
      aria-label="Chart bucket size"
      className="w-full flex-wrap"
      value={value}
      onValueChange={onChange}
      options={GRANULARITIES.map((granularity) => {
        const disabled = !isGranularityUsable(range, granularity);
        const label = GRANULARITY_LABELS[granularity].toLowerCase();

        return {
          value: granularity,
          label: GRANULARITY_LABELS[granularity],
          disabled,
          title: disabled
            ? `Too many ${label} points for this range — pick a shorter range or a coarser group`
            : `Group by ${label}`,
        };
      })}
    />
  );
}
