import {IOrder} from "@/features/user-dashboard/buy/types/IOrder";
import {IRent} from "@/features/user-dashboard/rent/types/IRent";
import {api} from "@/lib/axios";

export const getAllActiveRentsService = async () => {
  const {data} = await api.get("/api/rents");
  const activeRents = data.rents.filter(
    (rent: IRent) => rent.status === "active",
  );
  return activeRents.length;
};

export const getAllOrdersService = async () => {
  const {data} = await api.get("/api/orders");
  const activeOrders = data.filter(
    (order: IOrder) => order.status === "pending",
  );

  return activeOrders.length;
};

export const getUserCountService = async () => {
  const {data} = await api.get("/api/admin/user-count");
  return data.count;
};
