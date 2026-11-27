import type {IOutfit, Variant} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import type {GarmentMeasurements} from "@/features/user-dashboard/AR";

export function getOutfitArFit(outfit: IOutfit, selectedVariant?: Variant) {
  const arModelUrl =
    typeof outfit.modelURL === "string" ? outfit.modelURL.trim() : "";
  const sizeMeasurements: Record<string, GarmentMeasurements> = {};
  if (arModelUrl && Array.isArray(outfit.variants)) {
    for (const variant of selectedVariant ? [selectedVariant] : outfit.variants) {
      for (const size of variant.sizes ?? []) {
        if (!size.size || Object.hasOwn(sizeMeasurements, size.size) || !size.measurements) continue;

        const {chest, bust, shoulder, waist, sleeveLength, outfitLength} = size.measurements;
        const measurements = {chest, bust, shoulder, waist, sleeveLength, outfitLength};
        if ([shoulder, waist].some((value) => typeof value === "number" && Number.isFinite(value) && value > 0)) {
          sizeMeasurements[size.size] = measurements;
        }
      }
    }
  }

  const arSizes = Object.keys(sizeMeasurements);
  return {arModelUrl, arSizes, sizeMeasurements, canTryInAR: arSizes.length > 0};
}
