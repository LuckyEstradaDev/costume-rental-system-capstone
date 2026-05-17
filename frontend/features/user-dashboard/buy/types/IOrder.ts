import type {Snapshot} from "@/features/user-dashboard/cart/types/ISnapshot";

export type OrderStatus =
  | "pending"
  | "received"
  | "cancelled";

export interface Payment {
  method?: string;
  transactionId?: string;
  paidAt?: Date;
}

export interface IOrder {
  _id?: string;
  type: "buy";
  userID: string;

  items: Snapshot[];

  totalAmount: number;

  status: OrderStatus;

  payment?: Payment;

  createdAt?: Date;
  updatedAt?: Date;
}
