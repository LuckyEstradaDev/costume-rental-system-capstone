import type {Snapshot} from "@/features/user-dashboard/cart/types/ISnapshot";

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
  _id?: string;
  type: "rent";
  userID: string;

  items: Snapshot[];

  rentalDays: number;
  pickupTime?: Date;
  returnTime?: Date;

  totalAmount: number;

  status: RentStatus;

  payment?: RentPayment;

  createdAt?: Date;
  updatedAt?: Date;
}
