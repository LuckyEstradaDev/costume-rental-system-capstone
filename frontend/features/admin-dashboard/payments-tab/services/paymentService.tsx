import {api} from "@/lib/axios";

export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

/** Resolved by the backend from the order/rent the payment belongs to. */
export type PaymentPayer = {
  firstName: string;
  lastName: string;
  email: string;
};

export type PaymentItem = {
  _id: string;
  referenceID: string;
  orderID?: string;
  method?: string;
  status: PaymentStatus;
  totalAmount?: number;
  cash?: number;
  change?: number;
  paidAt?: string | null;
  createdAt?: string;
  /** Null when the order/rent was deleted or never linked. */
  user?: PaymentPayer | null;
};

export const fetchPaymentsService = async (): Promise<PaymentItem[]> => {
  const {data} = await api.get<{message: string; data: PaymentItem[]}>(
    "/api/payment/",
  );
  return data.data || [];
};

export const markPaymentPaidService = async (
  orderID: string,
  method: string,
  cash: number,
): Promise<void> => {
  await api.patch("/api/payment", {
    orderID,
    method,
    cash,
  });
};
