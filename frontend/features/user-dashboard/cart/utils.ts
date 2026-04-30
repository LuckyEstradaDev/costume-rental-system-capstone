import type {Snapshot} from "./types/ISnapshot";

export const getCartItemKey = (item: Snapshot, index: number) =>
  `${item.outfitId}-${item.variantId}-${item.size}-${item.color}-${index}`;
