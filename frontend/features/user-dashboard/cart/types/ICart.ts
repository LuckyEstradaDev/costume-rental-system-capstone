export type ICartItem = {
  userId: string;
  items: {
    outfitId: string;
    variantId: string;
    size: string;
    quantity: number;
  }[];
};
