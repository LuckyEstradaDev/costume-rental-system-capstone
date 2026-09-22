import { Types } from "mongoose";
import type {IOrder} from "../interfaces/IOrder.js";
import type {IPackageCart} from "../interfaces/IPackageCart.js";
import type {IPayment} from "../interfaces/IPayment.js";
import type { Snapshot } from "../interfaces/ISnapshot.js";
import { OrderModel } from "../models/OrderModel.js";
import { OutfitModel } from "../models/OutfitModel.js";
import { PackageCartModel } from "../models/PackageCartModel.js";
import { PaymentModel } from "../models/PaymentModel.js";
import {OrderRepository} from "../repositories/OrderRepository.js";

const orderRepository = new OrderRepository();

export const orderService = (orderData: IOrder, paymentData: IPayment) => {
  return orderRepository.create(orderData, paymentData);
};

export const getOrdersByUserIdService = (userId: string) => {
  return orderRepository.getByUserId(userId);
};

export const getAllOrdersService = () => {
  return orderRepository.getAll();
};

export const packageOrderService = (
  packageData: IPackageCart,
  paymentData: IPayment,
) => {
      //flatten all package item snapshots into a single consolidated order
    const items: Snapshot[] = packageData.packageItems.flatMap(
      (packageItem) => packageItem.items,
    );

    //build the order data with package items and total amount
    const totalAmount = packageData.packageItems.reduce(
      (total, packageItem) => {
        const packageTotal =
          packageItem.mode === "rental"
            ? packageItem.rentalTotal
            : packageItem.purchaseTotal;
        return total + (packageTotal ?? 0);
      },
      0,
    );

    const orderData: IOrder = {
      userID: new Types.ObjectId(packageData.userId),
      type: "purchase",
      items,
      isPackage: true,
      totalAmount,
      status: "pending",
    };


    const purchasedPackageIds = packageData.packageItems.map(
      (packageItem) => packageItem.packageId,
    );

    const order = orderRepository.createPackageOrder(
      orderData,
      items,
      packageData,
      paymentData,
      purchasedPackageIds,
    );
    return order;
};