import type {IPayment} from "../interfaces/IPayment.js";
import {PaymentModel} from "../models/PaymentModel.js";
import {HTTPError} from "../utils/HttpError.js";

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
    return await PaymentModel.find().sort({paidAt: -1});
  }
}
