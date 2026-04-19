import {CartModel} from "../models/CartModel.js";

type CartItem = {
  productId: string;
  variantId: string;
  quantity: number;
};

export class CartRepository {
  async create(userId: string, items: CartItem[]) {
    await CartModel.create({userId, items});
  }

  async getByUserId(userId: string) {
    return await CartModel.findOne({userId});
  }
}
