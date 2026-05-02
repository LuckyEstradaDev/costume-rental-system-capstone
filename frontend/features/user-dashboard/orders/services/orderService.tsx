import {api} from "@/lib/axios";
import type {OrderTrackingItem} from "../types/IOrderTracking";

type ApiOrderItem = Omit<
  OrderTrackingItem,
  "paymentMethod" | "paymentStatus" | "transactionId"
> & {
  payment?: {
    method?: string;
    transactionId?: string;
    paidAt?: string;
  };
};

export const fetchOrdersByUserIdService = async (userId: string) => {
  return api.get(`/api/users/orders/${userId}`);
};

export const fetchOrderByIdService = async (orderId: string) => {
  const response = await api.get<{data: ApiOrderItem}>(
    `/api/users/orders/details/${orderId}`,
  );

  return {
    ...response,
    data: {
      ...response.data,
      data: mapOrderTrackingItem(response.data.data),
    },
  };
};

export const mapOrderTrackingItem = (
  item: ApiOrderItem | OrderTrackingItem,
): OrderTrackingItem => {
  if ("paymentMethod" in item) {
    return item;
  }

  return {
    ...item,
    paymentMethod: item.payment?.method || "Not set",
    paymentStatus: item.payment?.paidAt ? "Paid" : "Unpaid",
    transactionId: item.payment?.transactionId,
  };
};
