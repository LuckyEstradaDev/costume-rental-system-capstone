import type {Snapshot} from "@/features/user-dashboard/cart/types/ISnapshot";

export type TrackingType = "order" | "rent";

export type TrackingStatus =
  | "pending"
  | "paid"
  | "active"
  | "overdue"
  | "returned"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "Cash on hand" | "Paid online";

export interface OrderTrackingItem {
  _id: string;
  referenceNumber: string;
  type: TrackingType;
  status: TrackingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  transactionId?: string;
  totalAmount: number;
  createdAt: string;
  rentStart?: string;
  rentEnd?: string;
  pickupTime?: string;
  returnTime?: string;
  items: Snapshot[];
}
