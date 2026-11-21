import type {Snapshot} from "../interfaces/ISnapshot.js";
import {OrderModel} from "../models/OrderModel.js";
import {PaymentModel} from "../models/PaymentModel.js";
import {RentModel} from "../models/RentModel.js";
import {NotificationRepository} from "../repositories/NotificationRepository.js";
import {OutfitRepository} from "../repositories/OutfitRepository.js";
import {notificationBuilder} from "../utils/notificationBuilder.js";
import {
  isReservationTerminal,
  RESERVATION_REFUND_WINDOW_DAYS,
  TERMINAL_RESERVATION_STATUSES,
} from "../utils/reservation.js";

const outfitRepo = new OutfitRepository();
const notifRepo = new NotificationRepository();

export const markReservationPayment = async (
  paymentId: string,
  intentId: string,
  isPaid: boolean,
) => {
  const payment = await PaymentModel.findById(paymentId);

  if (!payment || payment.reservation?.paymentIntentId !== intentId) {
    return null;
  }

  if (isReservationTerminal(payment)) {
    return payment;
  }

  if (!isPaid) {
    return PaymentModel.findByIdAndUpdate(
      paymentId,
      {$set: {"reservation.status": "failed"}},
      {new: true},
    );
  }

  const now = new Date();
  const deadlineAt = payment.reservation.deadlineAt
    ? new Date(payment.reservation.deadlineAt)
    : null;
  const order =
    (await OrderModel.findById(payment.orderID)) ??
    (await RentModel.findById(payment.orderID));

  if (
    !order ||
    order.status === "cancelled" ||
    (deadlineAt && now.getTime() > deadlineAt.getTime())
  ) {
    return PaymentModel.findByIdAndUpdate(
      paymentId,
      {$set: {"reservation.status": "expired"}},
      {new: true},
    );
  }

  const paidAt = now;
  const claimed = await PaymentModel.findOneAndUpdate(
    {
      _id: paymentId,
      "reservation.paymentIntentId": intentId,
      "reservation.status": {$nin: TERMINAL_RESERVATION_STATUSES},
    },
    {
      $set: {
        "reservation.status": "paid",
        "reservation.paidAt": paidAt,
        "reservation.refundableUntil": new Date(
          paidAt.getTime() +
            RESERVATION_REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000,
        ),
        "reservation.stockDeducted": false,
      },
    },
    {new: true},
  );

  if (!claimed) {
    return PaymentModel.findById(paymentId);
  }

  const stockClaim = await PaymentModel.findOneAndUpdate(
    {_id: paymentId, "reservation.stockDeducted": {$ne: true}},
    {$set: {"reservation.stockDeducted": true}},
    {new: true},
  );

  if (stockClaim) {
    try {
      await outfitRepo.deductStockFromItems(order.items as Snapshot[]);
    } catch (error) {
      await PaymentModel.updateOne(
        {_id: paymentId},
        {
          $set: {
            "reservation.status": "pending",
            "reservation.stockDeducted": false,
          },
          $unset: {
            "reservation.paidAt": "",
            "reservation.refundableUntil": "",
          },
        },
      );
      throw error;
    }
  }

  return PaymentModel.findById(paymentId);
};

export const expireUnpaidReservations = async () => {
  const duePayments = await PaymentModel.find({
    "reservation.requested": true,
    "reservation.status": {$in: ["pending", "failed"]},
    "reservation.deadlineAt": {$lte: new Date()},
  }).lean();

  let expired = 0;

  for (const payment of duePayments) {
    const claimed = await PaymentModel.findOneAndUpdate(
      {
        _id: payment._id,
        "reservation.status": {$in: ["pending", "failed"]},
        "reservation.deadlineAt": {$lte: new Date()},
      },
      {$set: {"reservation.status": "expired", status: "cancelled"}},
      {new: true},
    );

    if (!claimed) {
      continue;
    }

    const order = await OrderModel.findById(payment.orderID);

    if (order && order.status !== "cancelled") {
      await OrderModel.findByIdAndUpdate(
        order._id,
        {
          $set: {
            status: "cancelled",
            cancelledAt: new Date(),
            cancelledFrom: order.status,
          },
        },
        {runValidators: true},
      );

      if (claimed.reservation?.stockDeducted) {
        await outfitRepo.restoreStockFromItems(order.items as Snapshot[]);
        await PaymentModel.updateOne(
          {_id: claimed._id},
          {$set: {"reservation.stockDeducted": false}},
        );
      }

      await notifRepo.create(
        order.userID.toString(),
        notificationBuilder(
          "cancelled-purchase",
          order.referenceID,
          order._id.toString(),
        ),
      );
      expired++;
      continue;
    }

    const rent = await RentModel.findById(payment.orderID);

    if (rent && rent.status !== "cancelled") {
      await RentModel.findByIdAndUpdate(
        rent._id,
        {
          $set: {
            status: "cancelled",
            cancelledAt: new Date(),
            cancelledFrom: rent.status,
          },
        },
        {runValidators: true},
      );

      if (claimed.reservation?.stockDeducted) {
        await outfitRepo.restoreStockFromItems(rent.items as Snapshot[]);
        await PaymentModel.updateOne(
          {_id: claimed._id},
          {$set: {"reservation.stockDeducted": false}},
        );
      }

      await notifRepo.create(
        rent.userID.toString(),
        notificationBuilder(
          "cancelled-rent",
          rent.referenceID,
          rent._id.toString(),
        ),
      );
      expired++;
    }
  }

  return expired;
};
