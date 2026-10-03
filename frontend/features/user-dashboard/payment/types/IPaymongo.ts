export type OnlinePaymentMethod = "card" | "gcash" | "paymaya" | "qrph";

export const ONLINE_PAYMENT_METHODS: OnlinePaymentMethod[] = [
  "card",
  "gcash",
  "paymaya",
  "qrph",
];

export const METHOD_LABELS: Record<OnlinePaymentMethod, string> = {
  card: "Credit or debit card",
  gcash: "GCash",
  paymaya: "Maya",
  qrph: "QR Ph",
};

export const METHOD_HINTS: Record<OnlinePaymentMethod, string> = {
  card: "Visa, Mastercard, and other cards",
  gcash: "Pay with your GCash wallet",
  paymaya: "Pay with your Maya wallet",
  qrph: "Scan with any bank or wallet app",
};