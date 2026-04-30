import {api} from "@/lib/axios";
import {IOrder} from "../types/IOrder";

export const placeOrderService = async (orderData: IOrder) => {
  return api.post("/api/orders/create", orderData);
};
