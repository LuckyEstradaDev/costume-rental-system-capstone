import type {Types} from "mongoose";
import type {Snapshot} from "./ISnapshot.js";

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Payment {
  method?: string;
  transactionId?: string;
  paidAt?: Date;
}

export interface IOrder {
  _id?: Types.ObjectId;

  userID: Types.ObjectId;

  items: Snapshot[];

  totalAmount: number;

  status: OrderStatus;

  payment?: Payment;

  createdAt?: Date;
  updatedAt?: Date;
}
