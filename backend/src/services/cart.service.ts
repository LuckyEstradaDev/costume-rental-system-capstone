import {CartRepository} from "../repositories/CartRepository.js";

type CartItem = {
  productId: string;
  variantId: string;
  quantity: number;
};

let cartRepository = new CartRepository();

export const addToCartService = async (
  userId: string,
  items: CartItem[],
) => {
  await cartRepository.create(userId, items);
};

export const getCartByUserIdService = async (userId: string) => {
  return await cartRepository.getByUserId(userId);
};
