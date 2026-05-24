import type {IPayment} from "../interfaces/IPayment.js";
import {OrderModel} from "../models/OrderModel.js";
import {RentModel} from "../models/RentModel.js";
import {PaymentRepository} from "../repositories/PaymentRepository.js";

const paymentRepo = new PaymentRepository();

export const createPaymentService = async (data: IPayment) => {
  return paymentRepo.createPayment(data);
};

export const updatePaymentService = async (data: IPayment) => {
  const order = await OrderModel.findById(data.orderID);
  const rent = await RentModel.findById(data.orderID);

  if (order) {
    if (!order.paymentID) {
      throw new Error("Payment not found for the given orderID");
    }

    const updateData = {
      ...data,
      orderID: order._id,
      totalAmount: order.totalAmount,
      status: "paid" as const,
      paidAt: new Date(),
      ...(data.cash === undefined
        ? {}
        : {change: data.cash - order.totalAmount}),
    };

    const payment = await paymentRepo.updatePayment(
      order.paymentID.toString(),
      updateData,
    );

    if (!payment) {
      throw new Error("Payment not found for the given orderID");
    }

    order.paymentID = payment._id;
    await order.save();
    return payment;
  } else if (rent) {
    if (!rent.paymentID) {
      throw new Error("Payment not found for the given orderID");
    }

    const updateData = {
      ...data,
      orderID: rent._id,
      totalAmount: rent.totalAmount,
      status: "paid" as const,
      paidAt: new Date(),
      ...(data.cash === undefined
        ? {}
        : {change: data.cash - rent.totalAmount}),
    };

    const payment = await paymentRepo.updatePayment(
      rent.paymentID.toString(),
      updateData,
    );

    if (!payment) {
      throw new Error("Payment not found for the given orderID");
    }

    rent.paymentID = payment._id;
    await rent.save();
    return payment;
  } else {
    throw new Error("Order or Rent not found for the given orderID");
  }
};

export const getAllPaymentsService = async () => {
  return await paymentRepo.getAllPayments();
};
