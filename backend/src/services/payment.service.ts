import type {IPayment} from "../interfaces/IPayment.js";
import {OrderModel} from "../models/OrderModel.js";
import {RentModel} from "../models/RentModel.js";
import {PaymentRepository} from "../repositories/PaymentRepository.js";
import {HTTPError} from "../utils/HttpError.js";

const paymentRepo = new PaymentRepository();

type MarkPaidPayment = {
  status?: string | null;
  method?: string | null;
};

const assertPaymentCanBeMarkedPaid = (
  payment: MarkPaidPayment | null,
  linkedStatus: string | undefined,
  totalAmount: number,
  cash?: number,
) => {
  if (!payment) {
    throw new HTTPError("Payment not found for the given orderID", 404);
  }

  if (payment.status !== "pending") {
    throw new HTTPError("Only pending payments can be marked as paid.", 409);
  }

  if (payment.method === "cash" && linkedStatus !== "ready") {
    throw new HTTPError(
      "Cash payments can only be marked as paid when the order is ready for pickup.",
      409,
    );
  }

  if (payment.method === "cash" && cash === undefined) {
    throw new HTTPError("Cash amount is required for cash payments.", 400);
  }

  if (cash !== undefined && cash < totalAmount) {
    throw new HTTPError("Cash amount must be at least the order total.", 400);
  }
};

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

    if (order.status === "cancelled") {
      throw new Error("Cannot mark payment as paid for a cancelled order.");
    }

    const existingPayment = order.paymentID
      ? await paymentRepo.findById(order.paymentID.toString())
      : await paymentRepo.findByOrderId(order._id.toString());
    assertPaymentCanBeMarkedPaid(
      existingPayment,
      order.status,
      order.totalAmount,
      data.cash,
    );

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

    if (rent.status === "cancelled") {
      throw new Error("Cannot mark payment as paid for a cancelled rent.");
    }

    const existingPayment = rent.paymentID
      ? await paymentRepo.findById(rent.paymentID.toString())
      : await paymentRepo.findByOrderId(rent._id.toString());
    assertPaymentCanBeMarkedPaid(
      existingPayment,
      rent.status,
      rent.totalAmount,
      data.cash,
    );

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

export const markOrderOrRentPaymentRefundedService = async (id: string) => {
  return await paymentRepo.markOrderOrRentPaymentRefunded(id);
};
