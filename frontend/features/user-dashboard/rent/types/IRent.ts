import type {Snapshot} from "@/features/user-dashboard/cart/types/ISnapshot";

export type RentStatus =
  | "pending"
  | "active"
  | "overdue"
  | "returned"
  | "cancelled";

export type RentPaymentStatus = "pending" | "paid" | "refunded" | "failed";

export interface IRent {
  _id?: string;
  type: "rent";
  userID: string;

  items: Snapshot[];

  rentalDays: number;
  pickupTime?: Date | string;
  returnTime?: Date | string;
  duedate?: Date | string;

  totalAmount: number;

  status: RentStatus;

  paymentID?: string;
  paymentMethod?: string;

  createdAt?: string;
  updatedAt?: string;
}
