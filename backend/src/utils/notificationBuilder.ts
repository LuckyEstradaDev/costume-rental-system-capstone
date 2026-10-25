import type {INotification} from "../interfaces/INotification.js";

export const notificationBuilder = (
  type: string,
  referenceId?: string,
  orderId?: string,
) => {
  let notification: INotification = {
    title: "",
    description: "",
    type: "pending",
    orderReferenceId: referenceId || "",
    orderId: orderId || "",
    unread: true,
  };

  switch (type) {
    case "place-order":
      notification = {
        title: "Order placed successfully",
        description: `Order ${referenceId} is now pending.`,
        type: "success",
        orderReferenceId: referenceId!,
        orderId: orderId!,
        unread: true,
      };
      break;
    case "paid-order":
      notification = {
        title: "Payment confirmed",
        description: `Payment for order ${referenceId} has been confirmed.`,
        type: "confirmed",
        orderReferenceId: referenceId!,
        orderId: orderId!,
        unread: true,
      };
      break;
    case "cancelled-purchase":
      notification = {
        title: "Order cancelled",
        description: `Order ${referenceId} has been cancelled.`,
        type: "cancelled",
        orderReferenceId: referenceId!,
        orderId: orderId!,
        unread: true,
      };
      break;
    case "received-purchase":
      notification = {
        title: "Order received",
        description: `Order ${referenceId} has been received.`,
        type: "active",
        orderReferenceId: referenceId!,
        orderId: orderId!,
        unread: true,
      };
      break;
    case "active-rent":
      notification = {
        title: "Rent active",
        description: `Rent ${referenceId} is now active.`,
        type: "active",
        orderReferenceId: referenceId!,
        orderId: orderId!,
        unread: true,
      };
      break;
    case "returned-rent":
      notification = {
        title: "Rent returned",
        description: `Rent ${referenceId} has been returned.`,
        type: "success",
        orderReferenceId: referenceId!,
        orderId: orderId!,
        unread: true,
      };
      break;
    case "cancelled-rent":
      notification = {
        title: "Rent cancelled",
        description: `Rent ${referenceId} has been cancelled.`,
        type: "cancelled",
        orderReferenceId: referenceId!,
        orderId: orderId!,
        unread: true,
      };
      break;
    case "overdue-rent":
      notification = {
        title: "Rent overdue",
        description: `Rent ${referenceId} is overdue. Please return the outfit as soon as possible.`,
        type: "cancelled",
        orderReferenceId: referenceId!,
        orderId: orderId!,
        unread: true,
      };
      break;
    case "near-overdue-rent":
      notification = {
        title: "Rent due soon",
        description: `Rent ${referenceId} is due tomorrow. Please return the outfit on time.`,
        type: "pending",
        orderReferenceId: referenceId!,
        orderId: orderId!,
        unread: true,
      };
      break;
    default:
      break;
  }

  return notification;
};
