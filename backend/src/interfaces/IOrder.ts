import type {Types} from "mongoose";
import type {Snapshot} from "./ISnapshot.js";

export type OrderStatus = "pending" | "received" | "cancelled";

export interface Payment {
  method?: string;
  transactionId?: string;
  paidAt?: Date;
}

export interface IOrder {
  _id?: Types.ObjectId;

  userID: Types.ObjectId;

  type: "buy";

  items: Snapshot[];

  totalAmount: number;

  status: OrderStatus;

  payment?: Payment;

  createdAt?: Date;
  updatedAt?: Date;
}
