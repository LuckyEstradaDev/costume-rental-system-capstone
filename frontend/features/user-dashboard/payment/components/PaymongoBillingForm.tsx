"use client";

import {ExternalLink, UserRound} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import {METHOD_LABELS, type OnlinePaymentMethod} from "../types/IPaymongo";
import type {CardFormField, CardFormValues} from "./PaymongoCardForm";

type PaymongoBillingFormProps = {
  method: OnlinePaymentMethod;
  values: CardFormValues;
  errors?: Partial<Record<CardFormField, string>>;
  onChange: (field: CardFormField, value: string) => void;
  className?: string;
};

export function PaymongoBillingForm({
  method,
  values,
  errors = {},
  onChange,
  className,
}: PaymongoBillingFormProps) {
  const wallet = METHOD_LABELS[method];

  return (
    <Card className={cn("gap-4 rounded-lg border-border bg-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="size-4 text-primary" />
          {wallet} details
        </CardTitle>
        <CardDescription>
          Confirm the details associated with your {wallet} account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          <Field data-invalid={Boolean(errors.billingName)}>
            <FieldLabel htmlFor="walletName">Full name</FieldLabel>
            <Input
              id="walletName"
              name="billingName"
              autoComplete="cc-name"
              placeholder="Juan dela Cruz"
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
                placeholder="juan@example.com"
                value={values.billingEmail}
                onChange={(event) =>
                  onChange("billingEmail", event.target.value)
                }
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
                value={values.billingPhone}
                onChange={(event) =>
                  onChange("billingPhone", event.target.value)
                }
                aria-invalid={Boolean(errors.billingPhone)}
              />
              <FieldError>{errors.billingPhone}</FieldError>
            </Field>
          </div>

          <p className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <ExternalLink className="mt-0.5 size-3.5 shrink-0" />
            You&apos;ll be redirected to {wallet} to approve the payment, then
            brought straight back here.
          </p>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}