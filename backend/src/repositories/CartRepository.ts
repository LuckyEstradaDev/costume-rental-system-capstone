import type {ICartItem} from "../interfaces/ICart.js";
import {CartModel} from "../models/CartModel.js";

type CartItem = {
  productId: string;
  variantId: string;
  quantity: number;
};

export class CartRepository {
  async create(data: ICartItem) {
    if (await CartModel.findOne({userId: data.userId})) {
      return await CartModel.findOneAndUpdate(
        {userId: data.userId},
        {$push: {items: {$each: data.items}}},
        {new: true},
      );
    } else {
      const cart = new CartModel(data);
      return await cart.save();
    }
  }

  async getByUserId(userId: string) {
    return await CartModel.findOne({userId: userId}).sort({createdAt: -1});
  }

  async deleteItem(userId: string, outfitId: string) {
    return await CartModel.findOneAndUpdate(
      {userId: userId},
      {$pull: {items: {outfitId: outfitId}}},
      {new: true},
    );
  }
}
