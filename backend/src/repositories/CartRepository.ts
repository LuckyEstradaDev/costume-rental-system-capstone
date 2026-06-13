import type {ICartItem} from "../interfaces/ICart.js";
import {CartModel} from "../models/CartModel.js";

type CartItem = {
  productId: string;
  variantId: string;
  quantity: number;
};

export class CartRepository {
  async create(data: ICartItem) {
    const cart = await CartModel.findOne({userId: data.userId});

    if (cart) {
      const itemToAdd = data.items[0];

      const itemExists = cart.items.some(
        (item) => item.outfitId.toString() === itemToAdd?.outfitId.toString(),
      );

      if (itemExists) {
        throw new Error("Item already exists in cart.");
      }

      return await CartModel.findOneAndUpdate(
        {userId: data.userId},
        {$push: {items: {$each: data.items}}},
        {new: true},
      );
    }

    const newCart = new CartModel(data);
    return await newCart.save();
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
