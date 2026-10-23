export interface INotification extends Document {
    title: string;
    description: string;
    type?: "pending" | "active" | "success" | "cancelled" | "refunded" | "confirmed";
    orderReferenceId?: string;
    orderId: string;
    createdAt: Date;
    updatedAt: Date;
}