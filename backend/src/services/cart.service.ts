import type {ICartItem} from "../interfaces/ICart.js";
import {CartRepository} from "../repositories/CartRepository.js";

type CartItem = {
  productId: string;
  variantId: string;
  quantity: number;
};

let cartRepository = new CartRepository();

export const addToCartService = async (data: ICartItem) => {
  await cartRepository.create(data);
};

export const getCartByUserIdService = async (userId: string) => {
  return await cartRepository.getByUserId(userId);
};
