import {ISecurityDeposit} from "../../security-deposit/types/ISecurityDeposit";
import type {UserAddress} from "@/features/address/types";
import type {OutfitBranch} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import type {IReservation} from "@/features/user-dashboard/payment/types/IPayment";

export type AdminOrderType = "purchase" | "rent";

export type BuyOrderStatus = "pending" | "reserved" | "ready" | "received" | "cancelled";

export type RentOrderStatus =
  | "pending"
  | "reserved"
  | "ready"
  | "active"
  | "overdue"
  | "returned"
  | "cancelled";

export type AdminOrderStatus = BuyOrderStatus | RentOrderStatus;
export type AdminPaymentStatus = "pending" | "paid" | "refunded" | "failed" | "cancelled";

export interface AdminOrderItem {
  _id: string;
  referenceID?: string;
  userID: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    address?: UserAddress | null;
  };
  type: AdminOrderType;
  status: AdminOrderStatus;
  refundRequested?: boolean;
  refund?: {amount: number; reservationRefundDeadline?: string};
  cancelledAt?: string;
  cancelledFrom?: AdminOrderStatus;
  notes?: string;
  isPackage?: boolean;
  address?: UserAddress;
  totalAmount: number;
  paymentID?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  rentalDays?: number;
  eventDate?: string;
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
    refundedAt?: string;
    updatedAt?: string;
    paymentIntentId?: string;
    reservation?: IReservation;
  };
  items: {
    outfitId: string;
    outfitReferenceID?: string;
    variantId: string;
    name: string;
    category: string;
    branch?: OutfitBranch | null;
    size: string;
    color: string;
    quantity: number;
    imageURL: string;
    price: number;
  }[];
  securityDeposit?: ISecurityDeposit;
}
