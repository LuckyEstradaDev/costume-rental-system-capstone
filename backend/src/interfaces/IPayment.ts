import {Types} from "mongoose";

export interface IPayment {
  _id?: Types.ObjectId;
  referenceID?: string;
  orderID?: Types.ObjectId;
  method: string;
  status: "pending" | "paid" | "refunded" | "failed";
  totalAmount?: number;
  cash?: number;
  change?: number;
  paidAt?: Date;
}
