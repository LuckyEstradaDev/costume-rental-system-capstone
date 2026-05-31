import type {Types} from "mongoose";
import type {Snapshot} from "./ISnapshot.js";
import type {IPayment} from "./IPayment.js";

export type OrderStatus = "pending" | "received" | "cancelled";

export interface IOrder {
  _id?: Types.ObjectId;

  userID: Types.ObjectId;

  type: "buy";

  items: Snapshot[];

  totalAmount: number;

  status: OrderStatus;

  paymentID?: Types.ObjectId;
  paymentMethod: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export type INewOrder = IOrder & {payment?: IPayment};
