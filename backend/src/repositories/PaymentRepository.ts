import {Types} from "mongoose";
import type {IPayment} from "../interfaces/IPayment.js";
import {OrderModel} from "../models/OrderModel.js";
import {PaymentModel} from "../models/PaymentModel.js";
import {RentModel} from "../models/RentModel.js";
import {UserModel} from "../models/UserModel.js";
import {HTTPError} from "../utils/HttpError.js";
import {RESERVATION_WINDOW_HOURS} from "../utils/reservation.js";

export class PaymentRepository {
  async createPayment(data: IPayment) {
    try {
      const payment = await PaymentModel.create(data);
      if (!payment) {
        throw new HTTPError("Failed to create payment", 500);
      }
      return payment;
    } catch (error) {
      if (error instanceof HTTPError) {
        throw error;
      }
      throw new HTTPError(`Payment creation error: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
    }
  }

  async findById(id: string) {
    const payment = await PaymentModel.findById(id).lean();
    return payment;
  }

  async findByOrderId(orderId: string) {
    const payment = await PaymentModel.findOne({orderID: orderId}).lean();
    return payment;
  }

  async updatePayment(id: string, data: Partial<IPayment>) {
    try {
      const payment = await PaymentModel.findOneAndUpdate(
        {_id: id, status: "pending", $or: [
          {"reservation.requested": {$ne: true}},
          {"reservation.method": {$ne: "cash"}},
          {"reservation.status": "paid"},
          {$expr: {$gt: [
            {$ifNull: ["$reservation.deadlineAt", {$add: ["$createdAt", RESERVATION_WINDOW_HOURS * 60 * 60 * 1000]}]},
            new Date(),
          ]}},
        ]},
        {$set: data},
        {
          new: true,
          runValidators: true,
        },
      );

      if (!payment) {
        throw new HTTPError("Payment is no longer pending or its reservation deadline has passed.", 409);
      }

      return payment;
    } catch (error) {
      if (error instanceof HTTPError) {
        throw error;
      }
      throw new HTTPError(`Payment update error: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
    }
  }

  async getAllPayments() {
    const payments = await PaymentModel.find().sort({paidAt: -1}).lean();

    // A payment stores no payer. Its `orderID` points at either an order or a
    // rent, and those hold only `userID`, never the name. Resolve the chain in
    // three batched lookups rather than one query per payment.
    const transactionIds = payments.map((payment) => payment.orderID).filter((id): id is Types.ObjectId => Boolean(id));

    const [orders, rents] = await Promise.all([
      OrderModel.find({_id: {$in: transactionIds}})
        .select("userID")
        .lean(),
      RentModel.find({_id: {$in: transactionIds}})
        .select("userID")
        .lean(),
    ]);

    // An id lives in at most one collection, so a single map covers both.
    const userIdByTransaction = new Map<string, Types.ObjectId>();
    for (const transaction of [...orders, ...rents]) {
      userIdByTransaction.set(transaction._id.toString(), transaction.userID);
    }

    const users = await UserModel.find({
      _id: {$in: [...new Set(userIdByTransaction.values())]},
    })
      .select("firstName lastName email")
      .lean();

    const usersById = new Map(users.map((user) => [user._id.toString(), user]));

    return payments.map((payment) => {
      const userId = payment.orderID ? userIdByTransaction.get(payment.orderID.toString()) : undefined;

      return {
        ...payment,
        user: userId ? (usersById.get(userId.toString()) ?? null) : null,
      };
    });
  }

  async markOrderOrRentPaymentRefunded(
    paymentId: string,
    updatedAt: Date | undefined,
    refundReservation: boolean,
  ) {
    return PaymentModel.updateOne(
      {
        _id: paymentId,
        status: {$ne: "refunded"},
        updatedAt: updatedAt ?? {$exists: false},
      },
      {
        $set: {
          status: "refunded",
          refundedAt: new Date(),
          ...(refundReservation ? {"reservation.status": "refunded"} : {}),
        },
      },
      {runValidators: true},
    );
  }
}
