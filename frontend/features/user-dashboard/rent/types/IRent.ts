import type {Snapshot} from "@/features/user-dashboard/cart/types/ISnapshot";
import type {UserAddress} from "@/features/address/types";
import {IPayment} from "../../payment/types/IPayment";
import {ISecurityDeposit} from "@/features/admin-dashboard/security-deposit/types/ISecurityDeposit";

export type RentPaymentStatus = "pending" | "paid" | "refunded" | "failed";

export interface IRent {
  _id?: string;
  referenceID?: string;
  type: "rent";
  userID: string;

  items: Snapshot[];

  isPackage: boolean;
  rentalDays?: number;
  eventDate?: Date | string;
  pickupTime?: Date | string;
  returnTime?: Date | string;
  duedate?: Date | string;

  totalAmount: number;

  status: "pending" | "active" | "overdue" | "returned" | "cancelled";

  address?: UserAddress;

  payment: IPayment;
  securityDeposit?: ISecurityDeposit;

  createdAt?: string;
  updatedAt?: string;
}
