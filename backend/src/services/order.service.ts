import {Types} from "mongoose";
import type {IOrder} from "../interfaces/IOrder.js";
import type {IPackageCart} from "../interfaces/IPackageCart.js";
import type {IPayment} from "../interfaces/IPayment.js";
import type {Snapshot} from "../interfaces/ISnapshot.js";
import {NotificationRepository} from "../repositories/NotificationRepository.js";
import {OrderRepository} from "../repositories/OrderRepository.js";
import {CartRepository} from "../repositories/CartRepository.js";
import {notificationBuilder} from "../utils/notificationBuilder.js";

const orderRepository = new OrderRepository();
const cartRepo = new CartRepository();
const notifRepo = new NotificationRepository();

export const orderService = async (
  orderData: IOrder,
  paymentData: IPayment,
) => {
  const order = orderRepository.create(orderData, paymentData);

  const referenceId = (await order).referenceID;

  const outfit: any = orderData.items.map((item: Snapshot) => {
    return {
      outfitId: item.outfitId,
      variantId: item.variantId,
      size: item.size,
      quantity: item.quantity,
    };
  });

  await Promise.all(
    outfit.map((item: any) =>
      //remove the item from the cart after order has been placed
      cartRepo.deleteItem(
        orderData.userID.toString(),
        item.variantId,
        outfit.size,
      ),
    ),
  );

  notifRepo.create(
    orderData.userID.toString(),
    notificationBuilder("place-order", referenceId),
  );

  return order;
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
  const totalAmount = packageData.packageItems.reduce((total, packageItem) => {
    const packageTotal =
      packageItem.mode === "rental"
        ? packageItem.rentalTotal
        : packageItem.purchaseTotal;
    return total + (packageTotal ?? 0);
  }, 0);

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
