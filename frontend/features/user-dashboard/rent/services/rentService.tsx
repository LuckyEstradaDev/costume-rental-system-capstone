import {api} from "@/lib/axios";
import {IRent} from "../types/IRent";
import {IPayment} from "../../payment/types/IPayment";
import { IPackageCart } from "../../package/types/IPackageCart";

export const placeRentService = async (
  rentData: Partial<IRent>,
  paymentData: Partial<IPayment>,
) => {
  return api.post("/api/rents", {rentData, paymentData});
};

export const placePackageRentService = async(data: {packageData: IPackageCart, paymentData: Partial<IPayment>, rentalDays: number}) => {
  return api.post("/api/rents/package", data)
}