import type {ICartItem} from "../interfaces/ICart.js";
import {CartRepository} from "../repositories/CartRepository.js";

let cartRepository = new CartRepository();

export const addToCartService = async (data: ICartItem) => {
  const cart = await cartRepository.getByUserId(data.userId);

  if (cart) {
    const itemToAdd = data.items[0];

    const itemExists = cart.items.some(
      (item) =>
        item.variantId === itemToAdd!.variantId &&
        item.size === itemToAdd!.size,
    );

    if (itemExists) {
      // 409 so clients can distinguish "duplicate" from real server errors.
      throw Object.assign(
        new Error("This color and size combination is already in your cart."),
        {status: 409},
      );
    }

    return await cartRepository.update(data);
  }

  return await cartRepository.create(data);
};

export const getCartByUserIdService = async (userId: string) => {
  return await cartRepository.getByUserId(userId);
};

export const removeFromCartService = async (
  userId: string,
  variantId: string,
  size: string,
) => {
  return await cartRepository.deleteItem(userId, variantId, size);
};
