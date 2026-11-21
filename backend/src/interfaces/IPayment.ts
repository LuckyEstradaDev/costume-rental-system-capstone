import {Types} from "mongoose";

export type ReservationStatus =
  | "none"
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "refunded"
  | "forfeited";

export interface IReservation {
  requested: boolean;
  amount?: number;
  method?: string;
  status: ReservationStatus;
  deadlineAt?: Date;
  paidAt?: Date;
  refundableUntil?: Date;
  paymentIntentId?: string;
  stockDeducted?: boolean;
}

export interface IPayment {
  _id?: Types.ObjectId;
  referenceID?: string;
  orderID?: Types.ObjectId;
  method: string;
  status: "pending" | "paid" | "refunded" | "failed" | "cancelled";
  totalAmount?: number;
  cash?: number;
  change?: number;
  paidAt?: Date;
  paymentIntentId?: string;
  reservation?: IReservation;
}
