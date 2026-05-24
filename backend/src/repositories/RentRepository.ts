import type {INewRent} from "../interfaces/IRent.js";
import type {Snapshot} from "../interfaces/ISnapshot.js";
import {OutfitModel} from "../models/OutfitModel.js";
import {PaymentModel} from "../models/PaymentModel.js";
import {RentModel} from "../models/RentModel.js";

export class RentRepository {
  async createRent(data: INewRent) {
    const {payment, ...newRentData} = data;
    const rent = await RentModel.create(newRentData);

    if (payment) {
      const paymentDocument = await PaymentModel.create({
        ...payment,
        orderID: rent._id,
        totalAmount: rent.totalAmount,
        status: payment.paidAt ? "paid" : "pending",
      });

      rent.paymentID = paymentDocument._id;
      await rent.save();
    }

    const outfit: any = data.items.map((item: Snapshot) => {
      return {
        outfitID: item.outfitId,
        variantID: item.variantId,
        size: item.size,
        quantity: item.quantity,
      };
    });

    //deduct stocks from the outfit variants when placing orders
    await Promise.all(
      outfit.map((item: any) =>
        OutfitModel.findByIdAndUpdate(
          item.outfitID,
          {$inc: {[`variants.$[variant].sizes.$[size].stock`]: -item.quantity}},
          {
            arrayFilters: [
              {"variant._id": item.variantID},
              {"size.size": item.size},
            ],
          },
        ).exec(),
      ),
    );

    await Promise.all(
      outfit.map((item: any) =>
        //remove the item from the cart after order has been placed
        RentModel.findOneAndUpdate(
          {userId: data.userID.toString()},
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

    return rent;
  }

  async getAllRents() {
    const rents = await RentModel.find().lean();
    return this.attachPayments(rents);
  }

  async getRentByUserId(id: string) {
    const rents = await RentModel.find({
      userID: id,
    }).lean();

    return this.attachPayments(rents);
  }

  async updateRent(id: string, updateData: Partial<INewRent>) {
    return await RentModel.findByIdAndUpdate(id, updateData, {new: true});
  }

  private async attachPayments<T extends {_id?: unknown; paymentID?: unknown}>(items: T[]) {
    const paymentIds = items.map((item) => item.paymentID).filter(Boolean).map(String);
    const itemIds = items.map((item) => item._id).filter(Boolean).map(String);
    const paymentsById = await PaymentModel.find({_id: {$in: paymentIds}}).lean();
    const paymentsByOrder = await PaymentModel.find({orderID: {$in: itemIds}}).lean();
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
