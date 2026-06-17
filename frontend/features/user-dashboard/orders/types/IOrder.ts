import {Snapshot} from "../../cart/types/ISnapshot";
import {IPayment} from "../../payment/types/IPayment";

export interface IOrder {
  _id?: string;
  referenceID?: string;
  userID: string;

  type: "purchase";

  items: Snapshot[];

  totalAmount: number;

  status: "pending" | "received" | "cancelled";
  payment: IPayment;
  createdAt?: Date;
  updatedAt?: Date;
}
