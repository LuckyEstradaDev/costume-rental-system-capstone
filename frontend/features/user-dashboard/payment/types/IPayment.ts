export type ReservationStatus =
  | "none"
  | "pending"
  | "approved"
  | "paid"
  | "failed"
  | "expired"
  | "refunded"
  | "forfeited";

export interface IReservation {
  requested: boolean;
  amount?: number;
  method?: string;
  status?: ReservationStatus;
  deadlineAt?: Date | string;
  paidAt?: Date | string;
  refundableUntil?: Date | string;
  paymentIntentId?: string;
  stockDeducted?: boolean;
}

export interface IPayment {
  _id?: string;
  referenceID?: string;
  orderID?: string;
  method?: string;
  status: "pending" | "paid" | "refunded" | "failed" | "cancelled";
  totalAmount?: number;
  cash?: number;
  change?: number;
  paidAt?: Date;
  refundedAt?: Date | string;
  updatedAt?: Date | string;
  paymentIntentId?: string;
  reservation?: IReservation;
}
