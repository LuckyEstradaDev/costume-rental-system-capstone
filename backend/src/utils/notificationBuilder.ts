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
    orderReferenceId: "",
    orderId: "",
  };

  switch (type) {
    case "place-order":
      notification = {
        title: "Order placed successfully",
        description: `Order ${referenceId} is now pending.`,
        type: "success",
        orderReferenceId: referenceId!,
        orderId: orderId!,
      };
      break;
  }

  return notification;
};
