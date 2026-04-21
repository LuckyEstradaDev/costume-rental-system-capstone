import type {ICartItem} from "../interfaces/ICart.js";
import {CartModel} from "../models/CartModel.js";

type CartItem = {
  productId: string;
  variantId: string;
  quantity: number;
};

export class CartRepository {
  async create(data: ICartItem) {
    await CartModel.create(data);
  }

  async getByUserId(userId: string) {
    return await CartModel.findOne({userId});
  }
}
