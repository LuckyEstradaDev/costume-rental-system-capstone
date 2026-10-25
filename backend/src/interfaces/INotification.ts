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
  unread?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
