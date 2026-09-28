import {Types} from "mongoose";
import type {IPayment} from "../interfaces/IPayment.js";
import {OrderModel} from "../models/OrderModel.js";
import {PaymentModel} from "../models/PaymentModel.js";
import {RentModel} from "../models/RentModel.js";
import {UserModel} from "../models/UserModel.js";
import {HTTPError} from "../utils/HttpError.js";
import {UserRepository} from "./UserRepository.js";

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
      throw new HTTPError(
        `Payment creation error: ${error instanceof Error ? error.message : "Unknown error"}`,
        500,
      );
    }
  }

  async updatePayment(id: string, data: Partial<IPayment>) {
    try {
      const payment = await PaymentModel.findByIdAndUpdate(
        id,
        {$set: data},
        {
          new: true,
          runValidators: true,
        },
      );

      if (!payment) {
        throw new HTTPError(`Payment with ID ${id} not found`, 404);
      }

      return payment;
    } catch (error) {
      if (error instanceof HTTPError) {
        throw error;
      }
      throw new HTTPError(
        `Payment update error: ${error instanceof Error ? error.message : "Unknown error"}`,
        500,
      );
    }
  }

  async getAllPayments() {
    const payments = await PaymentModel.find().sort({paidAt: -1}).lean();

    // A payment stores no payer. Its `orderID` points at either an order or a
    // rent, and those hold only `userID` — never the name. Resolve the chain in
    // three batched lookups rather than one query per payment.
    const transactionIds = payments
      .map((payment) => payment.orderID)
      .filter((id): id is Types.ObjectId => Boolean(id));

    const [orders, rents] = await Promise.all([
      OrderModel.find({_id: {$in: transactionIds}}).select("userID").lean(),
      RentModel.find({_id: {$in: transactionIds}}).select("userID").lean(),
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
      const userId = payment.orderID
        ? userIdByTransaction.get(payment.orderID.toString())
        : undefined;

      return {
        ...payment,
        user: userId ? (usersById.get(userId.toString()) ?? null) : null,
      };
    });
  }

  async markOrderOrRentPaymentRefunded(id: string) {
    const order = await OrderModel.findById(id);

    if (order) {
      await PaymentModel.findByIdAndUpdate(
        order.paymentID,
        {status: "refunded"},
        {
          new: true,
          runValidators: true,
        },
      );
      const userRepo = new UserRepository();
      return userRepo.getOrderOrRentById(id);
    }

    const rent = await RentModel.findById(id);

    if (rent) {
      await PaymentModel.findByIdAndUpdate(
        rent.paymentID,
        {status: "refunded"},
        {
          new: true,
          runValidators: true,
        },
      );
      const userRepo = new UserRepository();
      return userRepo.getOrderOrRentById(id);
    }

    return null;
  }
}
