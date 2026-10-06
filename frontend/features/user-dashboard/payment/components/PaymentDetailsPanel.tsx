"use client";

import {QrCode} from "lucide-react";
import {
  METHOD_LABELS,
  ONLINE_PAYMENT_METHODS,
  type OnlinePaymentMethod,
} from "../types/IPaymongo";
import {PaymongoBillingForm} from "./PaymongoBillingForm";
import {PaymongoCardForm, type CardFormField} from "./PaymongoCardForm";

export function resolvePaymentMethod(method?: string): OnlinePaymentMethod {
  return ONLINE_PAYMENT_METHODS.includes(method as OnlinePaymentMethod)
    ? (method as OnlinePaymentMethod)
    : "card";
}

type PaymentDetailsPanelProps = {
  method?: string;
  values: PaymentDetailsPanelValues;
  errors?: Partial<Record<CardFormField, string>>;
  updateField: (field: string, value: string) => void;
};

export type BillingFieldValues = {
  billingName: string;
  billingEmail: string;
  billingPhone: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingPostalCode: string;
};

export type CardFieldValues = {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
};

export type BillingField = keyof BillingFieldValues;
export type CardField = keyof CardFieldValues;

export type PaymentDetailsPanelValues = CardFieldValues & BillingFieldValues;

export type PaymentDetailsPanelField = keyof PaymentDetailsPanelValues;

export function PaymentDetailsPanel({
  method,
  values,
  errors = {},
  updateField,
}: PaymentDetailsPanelProps) {
  const resolved = resolvePaymentMethod(method);
  const handleChange = (field: CardFormField, value: string) =>
    updateField(field, value);

  if (resolved === "qrph") {
    return (
      <div className="flex items-start gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <QrCode className="mt-0.5 size-4 shrink-0" />
        <span>
          A {METHOD_LABELS.qrph} code will be generated for this order. Open any
          participating bank or wallet app and scan it to pay.
        </span>
      </div>
    );
  }

  if (resolved === "gcash" || resolved === "paymaya") {
    return (
      <PaymongoBillingForm
        method={resolved}
        values={values}
        errors={errors}
        onChange={handleChange}
      />
    );
  }

  return (
    <PaymongoCardForm
      values={values}
      errors={errors}
      onChange={handleChange}
    />
  );
}