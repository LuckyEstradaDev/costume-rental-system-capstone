export type OrderTrackingType = "buy" | "rent";

export interface OrderTrackingItem {
  _id: string;
  type: OrderTrackingType;
  status: TrackingStatus;
  paymentStatus: string;
  paymentMethod: string;
  transactionId?: string;
  totalAmount: number;
  createdAt: string;
  rentStart?: string;
  rentEnd?: string;
  pickupTime?: string;
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
    price: number | string;
  }[];
}

export type TrackingStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "overdue"
  | "returned"
  | "active";
