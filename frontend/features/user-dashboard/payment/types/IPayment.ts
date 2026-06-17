export interface IPayment {
  _id?: string;
  referenceID?: string;
  orderID?: string;
  method?: string;
  status: "pending" | "paid" | "refunded" | "failed";
  totalAmount?: number;
  cash?: number;
  change?: number;
  paidAt?: Date;
}
