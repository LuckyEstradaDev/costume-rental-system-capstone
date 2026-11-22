"use client";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import type {BillingField, BillingFieldValues} from "./PaymentDetailsPanel";

type PaymongoBillingFormProps = {
  values: BillingFieldValues;
  errors?: Partial<Record<BillingField, string>>;
  onChange: (field: BillingField, value: string) => void;
  className?: string;
};

export function PaymongoBillingForm({
  values,
  errors = {},
  onChange,
  className,
}: PaymongoBillingFormProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h2 className="text-base font-semibold text-primary">Billing details</h2>

      <FieldGroup>
        <Field data-invalid={Boolean(errors.billingName)}>
          <FieldLabel htmlFor="walletName">Full name</FieldLabel>
          <Input
            id="walletName"
            name="billingName"
            autoComplete="cc-name"
            placeholder="Juan dela Cruz"
            className="h-9"
            value={values.billingName}
            onChange={(event) => onChange("billingName", event.target.value)}
            aria-invalid={Boolean(errors.billingName)}
          />
          <FieldError>{errors.billingName}</FieldError>
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.billingEmail)}>
            <FieldLabel htmlFor="walletEmail">Email</FieldLabel>
            <Input
              id="walletEmail"
              name="billingEmail"
              type="email"
              autoComplete="email"
              placeholder="johndoe@email.com"
              className="h-9"
              value={values.billingEmail}
              onChange={(event) => onChange("billingEmail", event.target.value)}
              aria-invalid={Boolean(errors.billingEmail)}
            />
            <FieldError>{errors.billingEmail}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.billingPhone)}>
            <FieldLabel htmlFor="walletPhone">Phone</FieldLabel>
            <Input
              id="walletPhone"
              name="billingPhone"
              type="tel"
              autoComplete="tel"
              placeholder="09171234567"
              className="h-9"
              value={values.billingPhone}
              onChange={(event) => onChange("billingPhone", event.target.value)}
              aria-invalid={Boolean(errors.billingPhone)}
            />
            <FieldError>{errors.billingPhone}</FieldError>
          </Field>
        </div>

      </FieldGroup>
    </div>
  );
}
