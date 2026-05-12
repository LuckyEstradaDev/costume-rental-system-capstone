import type {IOrder} from "../interfaces/IOrder.js";
import type { IOutfit } from "../interfaces/IOutfit.js";
import type { Snapshot } from "../interfaces/ISnapshot.js";
import {OrderModel} from "../models/OrderModel.js";
import { OutfitModel } from "../models/OutfitModel.js";

export class OrderRepository {
  async create(orderData: IOrder) {
    const order = OrderModel.create(orderData);
    const outfit: any = orderData.items.map((item: Snapshot) => {
      return {outfitID: item.outfitId, variantID: item.variantId, size: item.size, quantity: item.quantity};
    });

    //deduct stocks from the outfit variants when placing orders
    await Promise.all(
      outfit.map((item: any) =>
        OutfitModel.findByIdAndUpdate(item.outfitID, {$inc: {[`variants.$[variant].sizes.$[size].stock`]: -item.quantity}}, {arrayFilters: [{"variant._id": item.variantID}, {"size.size": item.size}]}).exec(),
      ),
    );

    return await order
  }

  async getByUserId(userId: string) {
    return await OrderModel.find({userID: userId}).exec();
  }
}
