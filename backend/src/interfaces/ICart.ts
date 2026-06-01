export type ICartItem = {
  userId: string;
  items: {
    outfitId: string;
    variantId: string;
    size: string;
    quantity: number;
    //snapshot of the item at the time of adding to cart
    name: string;
    imageURL: string;
    price: number;
    rentalPrice?: number;
    category: string;
  }[];
};
