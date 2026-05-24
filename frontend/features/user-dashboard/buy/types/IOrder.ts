import type {Snapshot} from "@/features/user-dashboard/cart/types/ISnapshot";

export type OrderStatus =
  | "pending"
  | "received"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

export interface Payment {
  method?: string;
  transactionId?: string;
  status?: PaymentStatus;
  totalAmount?: number;
  cash?: number;
  change?: number;
  paidAt?: Date | string;
}

export interface IOrder {
  _id?: string;
  type: "buy";
  userID: string;

  items: Snapshot[];

  totalAmount: number;

  status: OrderStatus;

  paymentID?: string;
  payment?: Payment;

  createdAt?: string;
  updatedAt?: string;
}
