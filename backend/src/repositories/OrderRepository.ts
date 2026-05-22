import type {IOrder} from "../interfaces/IOrder.js";
import type {IOutfit} from "../interfaces/IOutfit.js";
import type {Snapshot} from "../interfaces/ISnapshot.js";
import {CartModel} from "../models/CartModel.js";
import {OrderModel} from "../models/OrderModel.js";
import {OutfitModel} from "../models/OutfitModel.js";

export class OrderRepository {
  async create(orderData: IOrder) {
    const order = OrderModel.create(orderData);
    const outfit: any = orderData.items.map((item: Snapshot) => {
      return {
        outfitId: item.outfitId,
        variantId: item.variantId,
        size: item.size,
        quantity: item.quantity,
      };
    });

    //deduct stocks from the outfit variants when placing orders
    await Promise.all(
      outfit.map((item: any) =>
        OutfitModel.findByIdAndUpdate(
          item.outfitId,
          {$inc: {[`variants.$[variant].sizes.$[size].stock`]: -item.quantity}},
          {
            arrayFilters: [
              {"variant._id": item.variantId},
              {"size.size": item.size},
            ],
          },
        ).exec(),
      ),
    );

    await Promise.all(
      outfit.map((item: any) =>
        //remove the item from the cart after order has been placed
        CartModel.findOneAndUpdate(
          {userId: orderData.userID.toString()},
          {
            $pull: {
              items: {
                outfitId: item.outfitId,
              },
            },
          },
        ).exec(),
      ),
    );

    return await order;
  }

  async getByUserId(userId: string) {
    return await OrderModel.find({userID: userId}).exec();
  }

  async getAll() {
    return await OrderModel.find().exec();
  }
}
