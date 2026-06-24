import type {Types} from "mongoose";
import type {Snapshot} from "./ISnapshot.js";

export type OrderStatus = "pending" | "received" | "cancelled";

export interface IOrder {
  _id?: Types.ObjectId;
  referenceID: string;
  userID: Types.ObjectId;

  type: "purchase";

  items: Snapshot[];

  totalAmount: number;

  status: OrderStatus;

  paymentID?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}
