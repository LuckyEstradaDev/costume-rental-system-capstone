import {CartModel} from "../models/CartModel.js";

export class CartRepository {
  async create(userId: string, items: {productId: string; quantity: number}[]) {
    await CartModel.create({userId, items});
  }

  async getByUserId(userId: string) {
    return await CartModel.findOne({userId});
  }
}
