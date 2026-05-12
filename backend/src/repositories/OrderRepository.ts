import type {IOrder} from "../interfaces/IOrder.js";
import type { IOutfit } from "../interfaces/IOutfit.js";
import type { Snapshot } from "../interfaces/ISnapshot.js";
import {OrderModel} from "../models/OrderModel.js";
import { OutfitModel } from "../models/OutfitModel.js";

export class OrderRepository {
  async create(orderData: IOrder) {
    const order = OrderModel.create(orderData);
    const outfit: any = orderData.items.map((item: Snapshot) => {
      return {outfitID: item.outfitId, variantID: item.variantId, quantity: item.quantity};
    });

    //deduct stocks from the outfit variants when placing orders
    outfit.forEach((item: any) => {
      OutfitModel.findByIdAndUpdate(item.outfitID, {$inc: {[`variants.$[variant].stock`]: -item.quantity}}, {arrayFilters: [{'variant._id': item.variantID}]}).exec(); 
    });

    return await order
  }

  async getByUserId(userId: string) {
    return await OrderModel.find({userID: userId}).exec();
  }
}
