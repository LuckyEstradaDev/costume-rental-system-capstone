import {UserRepository} from "../repositories/UserRepository.js";
import {OrderRepository} from "../repositories/OrderRepository.js";
import {PaymentRepository} from "../repositories/PaymentRepository.js";
import {RentRepository} from "../repositories/RentRepository.js";
import type {RentStatus} from "../interfaces/IRent.js";
import {OutfitRepository} from "../repositories/OutfitRepository.js";

const userRepo = new UserRepository();
const orderRepo = new OrderRepository();
const paymentRepo = new PaymentRepository();
const rentRepo = new RentRepository();
const outfitRepo = new OutfitRepository();

export const getAllRentsAndOrdersService = async () => {
  return userRepo.getAllRentsAndOrders();
};

export const getRentsAndOrdersByUserIdService = async (userId: string) => {
  return userRepo.getRentsAndOrdersByUserId(userId);
};

export const getOrderOrRentByIdService = async (id: string) => {
  return userRepo.getOrderOrRentById(id);
};

export const updateOrderOrRentStatusService = async (id: string, status: any) => {
  const order = await orderRepo.getById(id);

  if (order) {
    const updateData = {status};

    const updatedOrder = await orderRepo.findByIdAndUpdate(id, updateData);

    const payment =
      (order.paymentID ? await paymentRepo.findById(order.paymentID.toString()) : null) ||
      (await paymentRepo.findByOrderId(order._id.toString()));

    if (status === "cancelled") {
      if (payment!.status !== "paid") {
        //if the order is cancelled we mark the payment as cancelled,
        await userRepo.markPaymentCancelled(order._id.toString(), order.paymentID);
      }

      //restore the deducted stock when a purchase order is cancelled
      if (order.status !== "cancelled") {
        await outfitRepo.restoreStockFromItems(order.items);
      }
    } else if (status === "received") {
      //deduct the stocks from the outfit variants when the order is marked as recieved
      await outfitRepo.deductStockFromItems(order.items);
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
  }

  if (status === "returned" && !rent.returnTime) {
    updateData.returnTime = new Date();
  }

  if ((status === "returned" || status === "cancelled") && rent.status !== "returned" && rent.status !== "cancelled") {
    const payment =
      (rent.paymentID ? await paymentRepo.findById(rent.paymentID.toString()) : null) ||
      (await paymentRepo.findByOrderId(rent._id.toString()));

    if (status === "cancelled" && payment!.status !== "paid") {
      //if the rent is cancelled we mark the payment as cancelled,
      await userRepo.markPaymentCancelled(rent._id.toString(), rent.paymentID);
    }
    await outfitRepo.restoreStockFromItems(rent.items);
  } else if (status === "active") {
    //deduct the stocks from the outfit variants when the order is marked as recieved
    await outfitRepo.deductStockFromItems(rent.items);
  }

  return await rentRepo.findByIdAndUpdate(id, updateData);
};

export const markOrderOrRentPaymentPaidService = async (id: string, cash?: number) => {
  return userRepo.markOrderOrRentPaymentPaid(id, cash);
};
