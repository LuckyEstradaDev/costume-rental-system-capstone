import type {Snapshot} from "@/features/user-dashboard/cart/types/ISnapshot";
import {IPayment} from "../../payment/types/IPayment";

export type RentPaymentStatus = "pending" | "paid" | "refunded" | "failed";

export interface IRent {
  _id?: string;
  referenceID?: string;
  type: "rent";
  userID: string;

  items: Snapshot[];

  rentalDays?: number;
  pickupTime?: Date | string;
  returnTime?: Date | string;
  duedate?: Date | string;

  totalAmount: number;

  status: "pending" | "active" | "overdue" | "returned" | "cancelled";

  payment: IPayment;

  createdAt?: string;
  updatedAt?: string;
}
