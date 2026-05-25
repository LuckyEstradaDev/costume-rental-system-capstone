export type OrderTrackingType = "buy" | "rent";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

export interface OrderTrackingItem {
  _id: string;
  referenceID?: string;
  userID?: string;
  type: OrderTrackingType;
  status: TrackingStatus;
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
  };
  createdAt: string;
  updatedAt?: string;
  rentalDays?: number;
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
  | "received"
  | "cancelled"
  | "overdue"
  | "returned"
  | "active";
