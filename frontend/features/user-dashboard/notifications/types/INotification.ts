export interface INotification {
  _id?: string;
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
  unread: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
