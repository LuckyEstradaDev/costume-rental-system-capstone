import type {ICartItem} from "../interfaces/ICart.js";
import {CartModel} from "../models/CartModel.js";

type CartItem = {
  productId: string;
  variantId: string;
  quantity: number;
};

export class CartRepository {
  async create(data: ICartItem) {
    const newCart = new CartModel(data);
    return await newCart.save();
  }

  async getByUserId(userId: string) {
    return await CartModel.findOne({userId: userId}).sort({createdAt: -1});
  }

  async deleteItem(userId: string, variantId: string, size: string) {
    return await CartModel.findOneAndUpdate(
      {userId},
      {
        $pull: {
          items: {
            variantId,
            size,
          },
        },
      },
      {new: true},
    );
  }

  async update(data: ICartItem) {
    return await CartModel.findOneAndUpdate(
      {userId: data.userId},
      {$push: {items: {$each: data.items}}},
      {new: true},
    );
  }
}
