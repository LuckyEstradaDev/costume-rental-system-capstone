import {api} from "@/lib/axios";
import {IRent} from "../../rent/types/IRent";
import {IOrder} from "../../buy/types/IOrder";

export interface UserOrdersResponse {
  orders: IOrder[];
  rents: IRent[];
}

export const fetchOrdersByUserIdService = async (userId: string): Promise<UserOrdersResponse> => {
  const {data} = await api.get<{data: UserOrdersResponse}>(`/api/users/orders/${userId}`);
  return data.data;
};

interface RefundRequestDetails {
  amount: number;
  eligibility:
    | "eligible"
    | "requested"
    | "refunded"
    | "reservation-window-expired"
    | "no-refundable-payment";
  requested: boolean;
}

export type UserOrderDetails = (IOrder | IRent) & {
  refund?: RefundRequestDetails;
};

export const fetchOrderByIdService = async (orderId: string): Promise<UserOrderDetails> => {
  const {data} = await api.get<{data: UserOrderDetails}>(`/api/users/orders/details/${orderId}`);
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

export const requestOrderRefundService = async (orderId: string) => {
  const {data} = await api.post<{data: RefundRequestDetails & {refundRequested: boolean}}>(
    `/api/users/orders/details/${encodeURIComponent(orderId)}/refund-request`,
  );
  return data.data;
};
