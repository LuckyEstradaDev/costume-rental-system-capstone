import {IOrder} from "@/features/user-dashboard/buy/types/IOrder";
import {IRent} from "@/features/user-dashboard/rent/types/IRent";
import {api} from "@/lib/axios";

export interface RentsResponse {
  activeRents: IRent[];
  allRents: IRent[];
  completedRents: IRent[];
}

export interface OrdersResponse {
  activeOrders: IOrder[];
  allOrders: IOrder[];
}

export interface UserCountResponse {
  data: {
    count: number;
    aggregate?: {date: string; count: number}[];
  };
}

export interface PaymentItem {
  createdAt: string;
  totalAmount: string;
  status: string;
}

export const getAllActiveRentsService = async (): Promise<RentsResponse> => {
  const res = await api.get<{rents: IRent[]}>("/api/rents");
  const activeRents = res.data.rents.filter(
    (rent: IRent) => rent.status === "active",
  );
  const completedRents = res.data.rents.filter(
    (rent: IRent) => rent.status === "returned",
  );
  return {activeRents, allRents: res.data.rents, completedRents};
};

export const getAllOrdersService = async (): Promise<OrdersResponse> => {
  const res = await api.get<IOrder[]>("/api/orders");
  const activeOrders = res.data.filter(
    (order: IOrder) => order.status === "pending",
  );

  return {activeOrders, allOrders: res.data};
};

export const getUserCountService = async (): Promise<UserCountResponse> => {
  const {data} = await api.get<UserCountResponse>("/api/admin/user-count");
  return data;
};

export const getAllPaymentsService = async (): Promise<PaymentItem[]> => {
  const {data} = await api.get<{data: PaymentItem[]; message: string}>(
    "/api/payment/",
  );
  return data.data ?? [];
};
