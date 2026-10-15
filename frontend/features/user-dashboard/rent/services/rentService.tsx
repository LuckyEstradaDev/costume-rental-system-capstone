import {api} from "@/lib/axios";
import type {UserAddress} from "@/features/address/types";
import {IRent} from "../types/IRent";
import {IPayment} from "../../payment/types/IPayment";
import { IPackageCart } from "../../package/types/IPackageCart";

export const placeRentService = async (
  rentData: Partial<IRent>,
  paymentData: Partial<IPayment>,
) => {
  return api.post("/api/rents", {rentData, paymentData});
};

export const placePackageRentService = async (data: {
  packageData: IPackageCart;
  paymentData: Partial<IPayment>;
  rentalDays: number;
  eventDate: string;
  address: UserAddress;
}) => {
  return api.post("/api/rents/package", data);
};