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

export const updateAdminOrderStatusService = async (
  orderId: string,
  status: AdminOrderStatus,
) => {
  return api.patch<{data: AdminOrderItem}>(
    `/api/users/orders/details/${orderId}/status`,
    {status},
  );
};
