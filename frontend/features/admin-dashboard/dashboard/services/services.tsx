import {IOrder} from "@/features/user-dashboard/buy/types/IOrder";
import {IRent} from "@/features/user-dashboard/rent/types/IRent";
import {api} from "@/lib/axios";

export const getAllActiveRentsService = async () => {
  const {data} = await api.get("/api/rents");
  const activeRents = data.rents.filter(
    (rent: IRent) => rent.status === "active",
  );
  return {activeRents, allRents: data.rents};
};

export const getAllOrdersService = async () => {
  const {data} = await api.get("/api/orders");
  const activeOrders = data.filter(
    (order: IOrder) => order.status === "pending",
  );

  return {activeOrders, allOrders: data};
};

export const getUserCountService = async () => {
  const {data} = await api.get("/api/admin/user-count");
  return data.count;
};

export const getAllPaymentsService = async () => {
  const {data} = await api.get("/api/payment/");
  return data.data;
};
