import {UserRepository} from "../repositories/UserRepository.js";
import {OrderRepository} from "../repositories/OrderRepository.js";
import {PaymentRepository} from "../repositories/PaymentRepository.js";
import {RentRepository} from "../repositories/RentRepository.js";
import type {RentStatus} from "../interfaces/IRent.js";
import {OutfitRepository} from "../repositories/OutfitRepository.js";
import {NotificationRepository} from "../repositories/NotificationRepository.js";
import {notificationBuilder} from "../utils/notificationBuilder.js";
import {PaymentModel} from "../models/PaymentModel.js";

const userRepo = new UserRepository();
const orderRepo = new OrderRepository();
const paymentRepo = new PaymentRepository();
const rentRepo = new RentRepository();
const outfitRepo = new OutfitRepository();
const notifRepo = new NotificationRepository();

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
  status: any,
) => {
  const order = await orderRepo.getById(id);

  if (order) {
    const updateData = {status};

    const updatedOrder = await orderRepo.findByIdAndUpdate(
      order._id.toString(),
      updateData,
    );

    const payment =
      (order.paymentID
        ? await paymentRepo.findById(order.paymentID.toString())
        : null) || (await paymentRepo.findByOrderId(order._id.toString()));

    if (status === "cancelled") {
      if (payment!.status !== "paid") {
        //if the order is cancelled we mark the payment as cancelled,
        await userRepo.markPaymentCancelled(
          order._id.toString(),
          order.paymentID,
        );
      }

      //restore the deducted stock when a purchase order is cancelled
      if (order.status !== "cancelled") {
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
    } else if (status === "received") {
      //deduct the stocks from the outfit variants when the order is marked as recieved
      await outfitRepo.deductStockFromItems(order.items);

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

  //-------- RENT AREA ------

  const rent = await rentRepo.getById(id);

  if (!rent) {
    return null;
  }

  const updateData: {
    status: RentStatus;
    pickupTime?: Date;
    returnTime?: Date;
    duedate?: Date;
  } = {
    status,
  };

  if (status === "active" && !rent.pickupTime) {
    //the due date is derived from the customer's event date (+return window)
    //at creation time, so pickup only records when the outfit was collected.
    updateData.pickupTime = new Date();
    notifRepo.create(
      rent.userID.toString(),
      notificationBuilder("active-rent", rent.referenceID, rent._id.toString()),
    );
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
    const payment =
      (rent.paymentID
        ? await paymentRepo.findById(rent.paymentID.toString())
        : null) || (await paymentRepo.findByOrderId(rent._id.toString()));

    if (status === "cancelled" && payment!.status !== "paid") {
      //if the rent is cancelled we mark the payment as cancelled,
      await userRepo.markPaymentCancelled(rent._id.toString(), rent.paymentID);
      notifRepo.create(
        rent.userID.toString(),
        notificationBuilder(
          "cancelled-rent",
          rent.referenceID,
          rent._id.toString(),
        ),
      );
    }
    await outfitRepo.restoreStockFromItems(rent.items);
  } else if (status === "active") {
    //deduct the stocks from the outfit variants when the order is marked as recieved
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

    const updateData: Record<string, Date | number | string> = {
      paidAt: new Date(),
      status: "paid",
    };

    if (cash !== undefined) {
      updateData.cash = cash;
      updateData.change = cash - order.totalAmount;
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

  const updateData: Record<string, Date | number | string> = {
    paidAt: new Date(),
    status: "paid",
  };

  if (cash !== undefined) {
    updateData.cash = cash;
    updateData.change = cash - rent.totalAmount;
  }

  await PaymentModel.findByIdAndUpdate(rent.paymentID, updateData, {
    new: true,
    runValidators: true,
  });

  notifRepo.create(
    rent.userID.toString(),
    notificationBuilder("paid-order", rent.referenceID, rent._id.toString()),
  );

  return userRepo.getOrderOrRentById(rent._id.toString());
};
