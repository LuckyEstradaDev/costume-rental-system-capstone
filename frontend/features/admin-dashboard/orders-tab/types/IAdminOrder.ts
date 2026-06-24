export type AdminOrderType = "purchase" | "rent";

export type BuyOrderStatus = "pending" | "received" | "cancelled";

export type RentOrderStatus =
  | "pending"
  | "active"
  | "overdue"
  | "returned"
  | "cancelled";

export type AdminOrderStatus = BuyOrderStatus | RentOrderStatus;
export type AdminPaymentStatus = "pending" | "paid" | "refunded" | "failed";

export interface AdminOrderItem {
  _id: string;
  referenceID?: string;
  userID: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  type: AdminOrderType;
  status: AdminOrderStatus;
  totalAmount: number;
  paymentID?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  rentalDays?: number;
  pickupTime?: string;
  duedate?: string;
  returnTime?: string;
  payment?: {
    _id?: string;
    referenceID?: string;
    method?: string;
    status?: AdminPaymentStatus;
    totalAmount?: number;
    transactionId?: string;
    cash?: number;
    change?: number;
    paidAt?: string;
  };
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
