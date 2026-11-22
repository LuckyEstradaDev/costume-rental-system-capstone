import type {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import type {GarmentMeasurements} from "@/features/user-dashboard/AR";

export function getOutfitArFit(outfit: IOutfit) {
  const arModelUrl =
    typeof outfit.modelURL === "string" ? outfit.modelURL.trim() : "";
  const sizeMeasurements: Record<string, GarmentMeasurements> = {};
  if (arModelUrl && Array.isArray(outfit.variants)) {
    for (const variant of outfit.variants) {
      for (const size of variant.sizes ?? []) {
        if (!size.size || Object.hasOwn(sizeMeasurements, size.size) || !size.measurements) continue;

        const {chest, bust, shoulder, sleeveLength, outfitLength} = size.measurements;
        const measurements = {chest, bust, shoulder, sleeveLength, outfitLength};
        if (Object.values(measurements).some((value) => typeof value === "number" && value > 0)) {
          sizeMeasurements[size.size] = measurements;
        }
      }
    }
  }

  const arSizes = Object.keys(sizeMeasurements).filter((size) => {
    const shoulder = sizeMeasurements[size].shoulder;
    return typeof shoulder === "number" && shoulder > 0;
  });
  return {arModelUrl, arSizes, sizeMeasurements, canTryInAR: arSizes.length > 0};
}
