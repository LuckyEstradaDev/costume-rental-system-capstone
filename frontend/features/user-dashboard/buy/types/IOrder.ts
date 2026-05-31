import type {Snapshot} from "@/features/user-dashboard/cart/types/ISnapshot";

export type OrderStatus = "pending" | "received" | "cancelled";

export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

export interface IOrder {
  _id?: string;
  type: "buy";
  userID: string;

  items: Snapshot[];

  totalAmount: number;

  status: OrderStatus;

  paymentID?: string;
  paymentMethod?: string;

  createdAt?: string;
  updatedAt?: string;
}
