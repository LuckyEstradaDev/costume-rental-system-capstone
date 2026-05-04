import {api} from "@/lib/axios";
import type {AdminOrderItem, AdminOrderStatus} from "../types/IAdminOrder";

export const fetchAdminOrdersService = async () => {
  return api.get<{
    data: {
      orders: AdminOrderItem[];
      rents: AdminOrderItem[];
    };
  }>("/api/users/orders");
};

export const fetchAdminOrderByIdService = async (orderId: string) => {
  return api.get<{data: AdminOrderItem}>(`/api/users/orders/details/${orderId}`);
};

export const updateAdminOrderStatusService = async (
  orderId: string,
  status: AdminOrderStatus,
) => {
  return api.patch<{data: AdminOrderItem}>(
    `/api/users/orders/details/${orderId}/status`,
    {status},
  );
};

export const markAdminOrderPaymentPaidService = async (orderId: string) => {
  return api.patch<{data: AdminOrderItem}>(
    `/api/users/orders/details/${orderId}/payment/paid`,
  );
};
