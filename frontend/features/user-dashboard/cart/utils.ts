import type {ICartItem} from "./types/ICart";

export type CartItemData = ICartItem["items"][number];

export const getCartItemKey = (item: CartItemData, index: number) =>
  `${item.outfitId}-${item.variantId}-${item.size}-${item.color}-${index}`;
