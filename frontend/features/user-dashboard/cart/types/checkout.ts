export type CheckoutFormState = {
  onlinePaymentMethod: string;
  transactionId: string;
  notes: string;
  rentStart: string;
  rentEnd: string;
  pickupTime: string;
  returnTime: string;
};

export type CheckoutMode = "rent" | "buy";

export type PaymentType = "cash" | "online";

export type UpdateCheckoutField = (field: string, value: string) => void;
