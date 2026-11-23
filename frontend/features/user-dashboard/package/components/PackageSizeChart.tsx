import type {Variant} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {MEASUREMENT_LABELS} from "@/lib/measurements";
import {compareSizes, formatSizeLabel} from "@/lib/size";
import {formatPackageMeasurement} from "../utils/formatters";

export function PackageSizeChart({
  sizes,
  selectedSize,
}: {
  sizes: Variant["sizes"];
  selectedSize?: string;
}) {
  const rows = sizes
    .map((size) => ({
      size: size.size,
      values: Object.fromEntries(
        Object.entries(size.measurements ?? {}).filter(
          (entry): entry is [string, number] =>
            typeof entry[1] === "number" && entry[1] > 0,
        ),
      ),
    }))
    .filter((row) => Object.keys(row.values).length > 0)
    .sort((a, b) => compareSizes(a.size, b.size));
  const labelOrder = Object.keys(MEASUREMENT_LABELS);
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row.values)))].sort(
    (a, b) => {
      const aIndex = labelOrder.indexOf(a);
      const bIndex = labelOrder.indexOf(b);
      return (aIndex < 0 ? 99 : aIndex) - (bIndex < 0 ? 99 : bIndex);
    },
  );

  if (rows.length === 0) return null;

  return (
    <section className="min-w-0 space-y-4">
      <h3 className="text-xl font-semibold text-primary md:text-2xl">Size chart</h3>
      <div className="overflow-x-auto" role="region" aria-label="Size measurements" tabIndex={0}>
        <table className="w-full border-separate border-spacing-y-2 text-left text-base">
          <caption className="sr-only">Garment measurements in inches</caption>
          <thead>
            <tr className="text-secondary/70">
              <th scope="col" className="px-4 py-1 font-medium">Size</th>
              {columns.map((key) => (
                <th key={key} scope="col" className="whitespace-nowrap px-4 py-1 font-medium">
                  {MEASUREMENT_LABELS[key] ?? key} (in)
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.size} className={row.size === selectedSize ? "bg-secondary text-secondary-foreground" : "bg-muted text-primary"}>
                <th scope="row" className="whitespace-nowrap rounded-l-xl px-4 py-3 font-semibold">
                  {formatSizeLabel(row.size)}
                </th>
                {columns.map((key, index) => (
                  <td key={key} className={"px-4 py-3 tabular-nums " + (index === columns.length - 1 ? "rounded-r-xl" : "")}>
                    {row.values[key] == null ? "—" : formatPackageMeasurement(row.values[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
