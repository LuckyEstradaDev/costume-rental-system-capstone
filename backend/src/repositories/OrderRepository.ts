import type {IOrder} from "../interfaces/IOrder.js";
import type {IOutfit} from "../interfaces/IOutfit.js";
import type {Snapshot} from "../interfaces/ISnapshot.js";
import {CartModel} from "../models/CartModel.js";
import {OrderModel} from "../models/OrderModel.js";
import {OutfitModel} from "../models/OutfitModel.js";
import {PaymentModel} from "../models/PaymentModel.js";

export class OrderRepository {
  async create(orderData: IOrder) {
    const {paymentID, ...newOrderData} = orderData;
    const order = await OrderModel.create(newOrderData);

    if (paymentID) {
      const paymentDocument = await PaymentModel.create({
        orderID: order._id,
        totalAmount: order.totalAmount,
        status: "pending",
      });

      order.paymentID = paymentDocument._id;
      await order.save();
    }

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

    return order;
  }

  async getByUserId(userId: string) {
    const orders = await OrderModel.find({userID: userId}).lean();
    return this.attachPayments(orders);
  }

  async getAll() {
    const orders = await OrderModel.find().lean();
    return this.attachPayments(orders);
  }

  private async attachPayments<T extends {_id?: unknown; paymentID?: unknown}>(
    items: T[],
  ) {
    const paymentIds = items
      .map((item) => item.paymentID)
      .filter(Boolean)
      .map(String);
    const itemIds = items
      .map((item) => item._id)
      .filter(Boolean)
      .map(String);
    const paymentsById = await PaymentModel.find({
      _id: {$in: paymentIds},
    }).lean();
    const paymentsByOrder = await PaymentModel.find({
      orderID: {$in: itemIds},
    }).lean();
    const payments = [...paymentsById, ...paymentsByOrder];
    const paymentsByPaymentId = new Map(
      payments.map((payment) => [payment._id.toString(), payment]),
    );
    const paymentsByOrderId = new Map(
      payments.map((payment) => [payment.orderID?.toString(), payment]),
    );

    return items.map((item) => ({
      ...item,
      payment: item.paymentID
        ? paymentsByPaymentId.get(item.paymentID.toString()) ||
          paymentsByOrderId.get(item._id?.toString())
        : paymentsByOrderId.get(item._id?.toString()) || null,
    }));
  }
}
