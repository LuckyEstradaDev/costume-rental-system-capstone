import {api} from "@/lib/axios";

export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

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
