import type {OnlinePaymentMethod} from "../../payment/types/IPaymongo";

export type CheckoutFormState = {
  onlinePaymentMethod: OnlinePaymentMethod;
  transactionId: string;
  notes: string;
  rentalDays: string;
  returnTime: string;
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  billingName: string;
  billingEmail: string;
  billingPhone: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingPostalCode: string;
};

export type CheckoutMode = "rent" | "purchase";

export type PaymentType = "cash" | "online";

export type UpdateCheckoutField = (field: string, value: string) => void;

export type CardFormState = Pick<
  CheckoutFormState,
  | "cardNumber"
  | "expMonth"
  | "expYear"
  | "cvc"
  | "billingName"
  | "billingEmail"
  | "billingPhone"
  | "billingAddress"
  | "billingCity"
  | "billingState"
  | "billingPostalCode"
>;