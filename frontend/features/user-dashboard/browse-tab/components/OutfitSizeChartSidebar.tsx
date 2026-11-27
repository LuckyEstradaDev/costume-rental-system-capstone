"use client";

import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import type {Variant} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {MEASUREMENT_LABELS} from "@/lib/measurements";
import {compareSizes, formatSizeLabel} from "@/lib/size";

interface OutfitSizeChartSidebarProps {
  variants: Variant[];
  activeSize?: string;
}

export function OutfitSizeChartSidebar({variants, activeSize}: OutfitSizeChartSidebarProps) {
  const chartRowsMap = new Map<string, Record<string, number>>();
  for (const variant of variants) {
    for (const size of variant.sizes ?? []) {
      if (!size.size || chartRowsMap.has(size.size)) continue;
      const values = Object.fromEntries(
        (Object.entries(size.measurements ?? {}) as [string, number | null | undefined][]).filter(
          ([, value]) => typeof value === "number" && value > 0,
        ),
      ) as Record<string, number>;
      if (Object.keys(values).length > 0) chartRowsMap.set(size.size, values);
    }
  }
  const chartRows = [...chartRowsMap.entries()]
    .map(([size, values]) => ({size, values}))
    .sort((a, b) => compareSizes(a.size, b.size));
  const labelOrder = Object.keys(MEASUREMENT_LABELS);
  const chartColumns = [...new Set(chartRows.flatMap((row) => Object.keys(row.values)))].sort(
    (a, b) => {
      const ai = labelOrder.indexOf(a);
      const bi = labelOrder.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    },
  );

  if (chartRows.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="text-base text-primary underline underline-offset-4 hover:text-primary-hover">
          Size chart
        </button>
      </DialogTrigger>
      <DialogContent placement="right" className="space-y-5 p-5 sm:p-6" aria-describedby={undefined}>
        <DialogTitle className="pr-10 text-xl font-semibold text-primary">Size chart</DialogTitle>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border text-left">
            <thead>
              <tr className="bg-muted text-sm text-muted-foreground">
                <th scope="col" className="px-4 py-1 font-medium">Size</th>
                {chartColumns.map((key) => (
                  <th scope="col" key={key} className="px-4 py-1 font-medium">
                    {MEASUREMENT_LABELS[key] ?? key} (in)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chartRows.map((row) => {
                const isSelectedRow = activeSize === row.size;
                return (
                  <tr
                    key={row.size}
                    className={`transition-colors ${
                      isSelectedRow ? "bg-secondary text-secondary-foreground" : "text-primary even:bg-muted"
                    }`}
                  >
                    <th scope="row" className="px-4 py-3 font-semibold">{formatSizeLabel(row.size)}</th>
                    {chartColumns.map((key) => (
                      <td
                        key={key}
                        className="px-4 py-3 tabular-nums"
                      >
                        {row.values[key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
