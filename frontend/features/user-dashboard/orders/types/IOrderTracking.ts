import type {IReservation} from "../../payment/types/IPayment";

export type OrderTrackingType = "purchase" | "rent";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed" | "cancelled";

export interface OrderTrackingItem {
  _id: string;
  referenceID?: string;
  userID?: string;
  type: OrderTrackingType;
  status: TrackingStatus;
  cancelledAt?: string;
  cancelledFrom?: TrackingStatus;
  notes?: string;
  paymentStatus: string;
  paymentMethod: string;
  transactionId?: string;
  totalAmount: number;
  paymentID?: string;
  payment?: {
    method?: string;
    status?: PaymentStatus;
    totalAmount?: number;
    transactionId?: string;
    cash?: number;
    change?: number;
    paidAt?: string;
    paymentIntentId?: string;
    reservation?: IReservation;
  };
  createdAt: string;
  updatedAt?: string;
  rentalDays?: number;
  eventDate?: string;
  pickupTime?: string;
  duedate?: string;
  returnTime?: string;
  items: {
    outfitId: string;
    variantId: string;
    name: string;
    category: string;
    size: string;
    color: string;
    quantity: number;
    imageURL: string;
    price: number;
  }[];
}

export type TrackingStatus =
  | "pending"
  | "reserved"
  | "ready"
  | "received"
  | "cancelled"
  | "overdue"
  | "returned"
  | "active";
