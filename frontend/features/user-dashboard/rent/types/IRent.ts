import type {Snapshot} from "@/features/user-dashboard/cart/types/ISnapshot";

export type RentStatus =
  | "pending"
  | "active"
  | "overdue"
  | "returned"
  | "cancelled";

export type RentPaymentStatus = "pending" | "paid" | "refunded" | "failed";

export interface RentPayment {
  method?: string;
  transactionId?: string;
  status?: RentPaymentStatus;
  totalAmount?: number;
  cash?: number;
  change?: number;
  paidAt?: Date | string;
}

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
  payment?: RentPayment;

  createdAt?: string;
  updatedAt?: string;
}
