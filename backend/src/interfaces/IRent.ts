import type {Types} from "mongoose";
import type {Snapshot} from "./ISnapshot.js";
import type {IPayment} from "./IPayment.js";

export type RentStatus =
  | "pending"
  | "active"
  | "overdue"
  | "returned"
  | "cancelled";

export interface IRent {
  _id?: Types.ObjectId;

  userID: Types.ObjectId;

  type: "rent";

  // match Order.items structure for consistency
  items: Snapshot[];

  rentalDays: number;
  pickupTime?: Date;
  returnTime?: Date;
  duedate: Date;

  // financial tracking (important addition)
  totalAmount: number;

  status: RentStatus;

  paymentID?: Types.ObjectId;
  paymentMethod: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export type INewRent = IRent & {payment?: IPayment};
