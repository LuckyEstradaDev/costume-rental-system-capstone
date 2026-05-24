import type {Types} from "mongoose";
import type {Snapshot} from "./ISnapshot.js";

export type OrderStatus = "pending" | "received" | "cancelled";

export interface IOrder {
  _id?: Types.ObjectId;

  userID: Types.ObjectId;

  type: "buy";

  items: Snapshot[];

  totalAmount: number;

  status: OrderStatus;

  paymentID?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}
