import type {Types} from "mongoose";
import type {Snapshot} from "./ISnapshot.js";

export type RentStatus =
  | "pending"
  | "active"
  | "overdue"
  | "returned"
  | "cancelled";

export interface RentPayment {
  method?: string;
  transactionId?: string;
  paidAt?: Date;
}

export interface IRent {
  _id?: Types.ObjectId;

  userID: Types.ObjectId;

  // match Order.items structure for consistency
  items: Snapshot[];

  // rental-specific dates
  rentStart: Date;
  rentEnd: Date;
  pickupTime?: Date;
  returnTime?: Date;

  // financial tracking (important addition)
  totalAmount: number;

  status: RentStatus;

  payment?: RentPayment;

  createdAt?: Date;
  updatedAt?: Date;
}

export type INewRent = Omit<IRent, "_id" | "createdAt" | "updatedAt">;
