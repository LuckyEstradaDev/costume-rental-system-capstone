import {api} from "@/lib/axios";
import {IOrder} from "../types/IOrder";
import {IPayment} from "../../payment/types/IPayment";
import { IPackageCart } from "../../package/types/IPackageCart";

export const placeOrderService = async (
  orderData: Partial<IOrder>,
  paymentData: Partial<IPayment>,
) => {
  return api.post("/api/orders/create", {orderData, paymentData});
};


export const placePackageOrderService = async (
  packageCart: IPackageCart,
  paymentData: Partial<IPayment>,
) => {
  return api.post("/api/orders/package", {packageCart, paymentData});
};
