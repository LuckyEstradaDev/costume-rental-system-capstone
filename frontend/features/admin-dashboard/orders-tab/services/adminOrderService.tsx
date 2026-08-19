import {api} from "@/lib/axios";
import type {AdminOrderItem, AdminOrderStatus} from "../types/IAdminOrder";

export const fetchAdminOrdersService = async (): Promise<AdminOrderItem[]> => {
  const {data} = await api.get<{
    data: {
      orders: AdminOrderItem[];
      rents: AdminOrderItem[];
    };
  }>("/api/users/orders");
  return [...data.data.orders, ...data.data.rents];
};

export const fetchAdminOrderByIdService = async (
  orderId: string,
): Promise<AdminOrderItem> => {
  const {data} = await api.get<{data: AdminOrderItem}>(
    `/api/users/orders/details/${orderId}`,
  );
  return data.data;
};

export const updateAdminOrderStatusService = async (
  orderId: string,
  status: AdminOrderStatus,
): Promise<AdminOrderItem> => {
  const {data} = await api.patch<{data: AdminOrderItem}>(
    `/api/users/orders/details/${orderId}/status`,
    {status},
  );
  return data.data;
};

export const markAdminOrderPaymentPaidService = async (
  orderId: string,
  cash?: number,
  method?: string,
): Promise<AdminOrderItem> => {
  await api.patch("/api/payment", {
    orderID: orderId,
    method: method,
    cash: cash,
  });

  return fetchAdminOrderByIdService(orderId);
};
