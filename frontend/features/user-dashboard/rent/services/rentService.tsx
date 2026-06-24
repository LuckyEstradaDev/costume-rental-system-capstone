import {api} from "@/lib/axios";
import {IRent} from "../types/IRent";
import {IPayment} from "../../payment/types/IPayment";

export const placeRentService = async (
  rentData: Partial<IRent>,
  paymentData: Partial<IPayment>,
) => {
  return api.post("/api/rents", {rentData, paymentData});
};
