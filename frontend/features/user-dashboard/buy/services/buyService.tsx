import {api} from "@/lib/axios";
import {IOrder} from "../types/IOrder";
import {IPayment} from "../../payment/types/IPayment";

export const placeOrderService = async (
  orderData: Partial<IOrder>,
  paymentData: Partial<IPayment>,
) => {
  return api.post("/api/orders/create", {orderData, paymentData});
};
