import {UserRepository} from "../repositories/UserRepository.js";
import {OrderRepository} from "../repositories/OrderRepository.js";
import {PaymentRepository} from "../repositories/PaymentRepository.js";
import {RentRepository} from "../repositories/RentRepository.js";
import type {RentStatus} from "../interfaces/IRent.js";
import type {OrderStatus} from "../interfaces/IOrder.js";
import {OutfitRepository} from "../repositories/OutfitRepository.js";
import {NotificationRepository} from "../repositories/NotificationRepository.js";
import {notificationBuilder} from "../utils/notificationBuilder.js";
import {assertValidStatusTransition} from "../utils/orderStatus.js";
import {HTTPError} from "../utils/HttpError.js";
import {PaymentModel} from "../models/PaymentModel.js";
import {
  getRemainingBalance,
  isReservationPaid,
  isReservationRequested,
  isWithinReservationRefundWindow,
} from "../utils/reservation.js";
import type {ReservationSource} from "../utils/reservation.js";

const isOrderStatus = (value: string): value is OrderStatus =>
  value === "pending" ||
  value === "reserved" ||
  value === "ready" ||
  value === "received" ||
  value === "cancelled";

const isRentStatus = (value: string): value is RentStatus =>
  value === "pending" ||
  value === "reserved" ||
  value === "ready" ||
  value === "active" ||
  value === "overdue" ||
  value === "returned" ||
  value === "cancelled";

const userRepo = new UserRepository();
const orderRepo = new OrderRepository();
const paymentRepo = new PaymentRepository();
const rentRepo = new RentRepository();
const outfitRepo = new OutfitRepository();
const notifRepo = new NotificationRepository();

const applyCancellationToPayment = async (
  payment: ReservationSource | null,
  transactionId: string,
) => {
  if (!isReservationRequested(payment)) {
    return;
  }

  const set: Record<string, unknown> = {};

  if (payment?.status !== "paid") {
    set.status = "cancelled";
  }

  if (isWithinReservationRefundWindow(payment)) {
    set["reservation.status"] = "forfeited";
  }

  if (payment?.reservation?.stockDeducted) {
    set["reservation.stockDeducted"] = false;
  }

  if (Object.keys(set).length > 0) {
    await PaymentModel.updateOne({orderID: transactionId}, {$set: set});
  }
};

export const getAllRentsAndOrdersService = async () => {
  return userRepo.getAllRentsAndOrders();
};

export const getRentsAndOrdersByUserIdService = async (userId: string) => {
  return userRepo.getRentsAndOrdersByUserId(userId);
};

export const getOrderOrRentByIdService = async (id: string) => {
  return userRepo.getOrderOrRentById(id);
};

export const hasAdminAccessService = async (userId: string) => {
  return userRepo.hasAdminAccess(userId);
};

export const updateOrderOrRentStatusService = async (
  id: string,
  status: OrderStatus | RentStatus,
) => {
  const existingRecord = await getOrderOrRentByIdService(id);

  if (!existingRecord) {
    return null;
  }

  assertValidStatusTransition(existingRecord, status);

  const order = await orderRepo.getById(id);

  if (order) {
    if (!isOrderStatus(status)) {
      throw new HTTPError("Invalid purchase status.", 400);
    }

    const updateData: {
      status: OrderStatus;
      cancelledAt?: Date;
      cancelledFrom?: OrderStatus;
    } = {
      status,
      ...(status === "cancelled"
        ? {cancelledAt: new Date(), cancelledFrom: order.status}
        : {}),
    };

    const updatedOrder = await orderRepo.findByIdAndUpdate(
      order._id.toString(),
      updateData,
    );

    const payment =
      (order.paymentID
        ? await paymentRepo.findById(order.paymentID.toString())
        : null) || (await paymentRepo.findByOrderId(order._id.toString()));

    if (status === "cancelled") {
      if (isReservationRequested(payment)) {
        await applyCancellationToPayment(payment, order._id.toString());
      } else if (payment?.status !== "paid") {
        await userRepo.markPaymentCancelled(
          order._id.toString(),
          order.paymentID,
        );
      }

      if (order.status === "received" || payment?.reservation?.stockDeducted) {
        await outfitRepo.restoreStockFromItems(order.items);
      }

      notifRepo.create(
        order.userID.toString(),
        notificationBuilder(
          "cancelled-purchase",
          order.referenceID,
          order._id.toString(),
        ),
      );
    } else if (status === "ready") {
      notifRepo.create(
        order.userID.toString(),
        notificationBuilder(
          "ready-purchase",
          order.referenceID,
          order._id.toString(),
        ),
      );
    } else if (status === "received") {
      if (!isReservationPaid(payment)) {
        await outfitRepo.deductStockFromItems(order.items);
      }

      notifRepo.create(
        order.userID.toString(),
        notificationBuilder(
          "received-purchase",
          order.referenceID,
          order._id.toString(),
        ),
      );
    }

    return updatedOrder;
  }

  const rent = await rentRepo.getById(id);

  if (!rent) {
    return null;
  }

  if (!isRentStatus(status)) {
    throw new HTTPError("Invalid rent status.", 400);
  }

  const payment =
    (rent.paymentID
      ? await paymentRepo.findById(rent.paymentID.toString())
      : null) || (await paymentRepo.findByOrderId(rent._id.toString()));

  const updateData: {
    status: RentStatus;
    cancelledAt?: Date;
    cancelledFrom?: RentStatus;
    pickupTime?: Date;
    returnTime?: Date;
    duedate?: Date;
  } = {
    status,
    ...(status === "cancelled"
      ? {cancelledAt: new Date(), cancelledFrom: rent.status}
      : {}),
  };

  if (status === "ready") {
    notifRepo.create(
      rent.userID.toString(),
      notificationBuilder("ready-rent", rent.referenceID, rent._id.toString()),
    );
  }

  if (status === "active" && !rent.pickupTime) {
    updateData.pickupTime = new Date();
  }

  if (status === "returned" && !rent.returnTime) {
    updateData.returnTime = new Date();
    notifRepo.create(
      rent.userID.toString(),
      notificationBuilder(
        "returned-rent",
        rent.referenceID,
        rent._id.toString(),
      ),
    );
  }

  if (
    (status === "returned" || status === "cancelled") &&
    rent.status !== "returned" &&
    rent.status !== "cancelled"
  ) {
    if (status === "cancelled") {
      if (isReservationRequested(payment)) {
        await applyCancellationToPayment(payment, rent._id.toString());
      } else if (payment?.status !== "paid") {
        await userRepo.markPaymentCancelled(rent._id.toString(), rent.paymentID);
      }
    }

    if (
      rent.status === "active" ||
      rent.status === "overdue" ||
      payment?.reservation?.stockDeducted
    ) {
      await outfitRepo.restoreStockFromItems(rent.items);
    }
  } else if (status === "active" && !isReservationPaid(payment)) {
    await outfitRepo.deductStockFromItems(rent.items);
  }

  return await rentRepo.findByIdAndUpdate(rent._id.toString(), updateData);
};

export const markNotificationReadService = async (
  userId: string,
  notificationId: string,
) => {
  return userRepo.markNotificationAsRead(userId, notificationId);
};

export const markOrderOrRentPaymentPaidService = async (
  id: string,
  cash?: number,
) => {
  const order = await orderRepo.getById(id);

  if (order) {
    if (order.status === "cancelled") {
      throw new Error("Cannot mark payment as paid for a cancelled order.");
    }

    const payment =
      (order.paymentID
        ? await paymentRepo.findById(order.paymentID.toString())
        : null) || (await paymentRepo.findByOrderId(order._id.toString()));

    if (isReservationRequested(payment) && !isReservationPaid(payment)) {
      throw new HTTPError(
        "Reservation payment must be paid before final payment.",
        409,
      );
    }

    const updateData: Record<string, Date | number | string> = {
      paidAt: new Date(),
      status: "paid",
    };

    if (cash !== undefined) {
      updateData.cash = cash;
      updateData.change = cash - getRemainingBalance(payment, order.totalAmount);
    }

    await PaymentModel.findByIdAndUpdate(order.paymentID, updateData, {
      new: true,
      runValidators: true,
    });

    notifRepo.create(
      order.userID.toString(),
      notificationBuilder(
        "paid-order",
        order.referenceID,
        order._id.toString(),
      ),
    );

    return userRepo.getOrderOrRentById(order._id.toString());
  }

  const rent = await rentRepo.getById(id);

  if (!rent) {
    return null;
  }

  if (rent.status === "cancelled") {
    throw new Error("Cannot mark payment as paid for a cancelled rent.");
  }

  if (!rent.securityDeposit) {
    throw new HTTPError(
      "A security deposit must be recorded before payment can be marked as paid.",
      409,
    );
  }

  const payment =
    (rent.paymentID
      ? await paymentRepo.findById(rent.paymentID.toString())
      : null) || (await paymentRepo.findByOrderId(rent._id.toString()));

  if (isReservationRequested(payment) && !isReservationPaid(payment)) {
    throw new HTTPError(
      "Reservation payment must be paid before final payment.",
      409,
    );
  }

  const updateData: Record<string, Date | number | string> = {
    paidAt: new Date(),
    status: "paid",
  };

  if (cash !== undefined) {
    updateData.cash = cash;
    updateData.change = cash - getRemainingBalance(payment, rent.totalAmount);
  }

  await PaymentModel.findByIdAndUpdate(rent.paymentID, updateData, {
    new: true,
    runValidators: true,
  });

  return userRepo.getOrderOrRentById(rent._id.toString());
};
