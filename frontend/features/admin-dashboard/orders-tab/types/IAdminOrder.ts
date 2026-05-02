export type AdminOrderType = "buy" | "rent";

export type BuyOrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export type RentOrderStatus =
  | "pending"
  | "active"
  | "overdue"
  | "returned"
  | "cancelled";

export type AdminOrderStatus = BuyOrderStatus | RentOrderStatus;

export interface AdminOrderItem {
  _id: string;
  userID: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  type: AdminOrderType;
  status: AdminOrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  rentStart?: string;
  rentEnd?: string;
  pickupTime?: string;
  returnTime?: string;
  payment?: {
    method?: string;
    transactionId?: string;
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
