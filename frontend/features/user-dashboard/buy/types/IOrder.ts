import {Snapshot} from "../../cart/types/ISnapshot";
import {IPayment} from "../../payment/types/IPayment";

export interface IOrder {
  _id?: string;
  referenceID?: string;
  userID: string;

  type: "purchase";

  items: Snapshot[];
  isPackage: boolean;

  totalAmount: number;

  status: "pending" | "reserved" | "ready" | "received" | "cancelled";
  refundRequested?: boolean;
  cancelledAt?: Date | string;
  cancelledFrom?: "pending" | "reserved" | "ready" | "received" | "cancelled";
  notes?: string;
  payment: IPayment; // this is optional and is only for the frontend
  paymentID?: string;
  createdAt?: Date | string;
  updatedAt?: Date;
}