export interface INotification {
  title: string;
  description: string;
  type?:
    | "pending"
    | "active"
    | "success"
    | "cancelled"
    | "refunded"
    | "confirmed";
  orderReferenceId?: string;
  orderId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
