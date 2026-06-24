export type CheckoutFormState = {
  onlinePaymentMethod: string;
  transactionId: string;
  notes: string;
  rentalDays: string;
  returnTime: string;
};

export type CheckoutMode = "rent" | "purchase";

export type PaymentType = "cash" | "online";

export type UpdateCheckoutField = (field: string, value: string) => void;
