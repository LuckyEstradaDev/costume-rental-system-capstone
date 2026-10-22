import {api} from "@/lib/axios";
import {IRent} from "../../rent/types/IRent";
import {IOrder} from "../../buy/types/IOrder";
import {AdminOrderStatus} from "@/features/admin-dashboard/orders-tab/types/IAdminOrder";

export interface UserOrdersResponse {
  orders: IOrder[];
  rents: IRent[];
}

export const fetchOrdersByUserIdService = async (userId: string): Promise<UserOrdersResponse> => {
  const {data} = await api.get<{data: UserOrdersResponse}>(`/api/users/orders/${userId}`);
  return data.data;
};

export const fetchOrderByIdService = async (orderId: string): Promise<IOrder | IRent> => {
  const {data} = await api.get<{data: IOrder | IRent}>(`/api/users/orders/details/${orderId}`);
  return data.data;
};

export const cancelOrderService = async ({
  orderId,
  status,
}: {
  orderId: string;
  status: "cancelled";
}): Promise<IOrder | IRent> => {
  const {data} = await api.patch<IOrder | IRent>(`/api/users/orders/details/${orderId}/status`, {status});
  return data;
};
