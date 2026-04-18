import {CartRepository} from "../repositories/CartRepository.js";

let cartRepository = new CartRepository();

export const addToCartService = async (
  userId: string,
  items: {productId: string; quantity: number}[],
) => {
  for (const {productId, quantity} of items) {
    await cartRepository.create(userId, items);
  }
};

export const getCartByUserIdService = async (userId: string) => {
  return await cartRepository.getByUserId(userId);
};
