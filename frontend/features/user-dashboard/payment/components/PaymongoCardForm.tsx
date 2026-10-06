"use client";

import {CreditCard, Lock} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {cn} from "@/lib/utils";
import type {
  PaymentDetailsPanelField,
  PaymentDetailsPanelValues,
} from "./PaymentDetailsPanel";

export type CardFormValues = PaymentDetailsPanelValues;

export type CardFormField = PaymentDetailsPanelField;

const MONTHS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

const CURRENT_YEAR = new Date().getFullYear();

type PaymongoCardFormProps = {
  values: CardFormValues;
  errors?: Partial<Record<CardFormField, string>>;
  onChange: (field: CardFormField, value: string) => void;
  className?: string;
};

export function PaymongoCardForm({
  values,
  errors = {},
  onChange,
  className,
}: PaymongoCardFormProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <CreditCard className="size-3.5 text-primary" />
          Card details
        </p>
        <Badge
          variant="outline"
          className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
        >
          <Lock />
          Secure
        </Badge>
      </div>

      <FieldGroup className="gap-2.5">
        <Field data-invalid={Boolean(errors.cardNumber)}>
          <FieldLabel htmlFor="cardNumber">Card number</FieldLabel>
          <Input
            id="cardNumber"
            name="cardNumber"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="4120 0000 0000 0007"
            maxLength={19}
            className="h-9 font-mono tracking-wider"
            value={values.cardNumber}
            onChange={(event) => onChange("cardNumber", event.target.value)}
            aria-invalid={Boolean(errors.cardNumber)}
          />
          <FieldError>{errors.cardNumber}</FieldError>
        </Field>

        <div className="grid grid-cols-3 gap-2.5">
          <Field data-invalid={Boolean(errors.expMonth)}>
            <FieldLabel htmlFor="expMonth">Month</FieldLabel>
            <Select
              value={values.expMonth}
              onValueChange={(value) => onChange("expMonth", value)}
            >
              <SelectTrigger id="expMonth" className="h-9 w-full">
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{errors.expMonth}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.expYear)}>
            <FieldLabel htmlFor="expYear">Year</FieldLabel>
            <Select
              value={values.expYear}
              onValueChange={(value) => onChange("expYear", value)}
            >
              <SelectTrigger id="expYear" className="h-9 w-full">
                <SelectValue placeholder="YYYY" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({length: 16}, (_, index) => {
                  const year = String(CURRENT_YEAR + index);
                  return (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <FieldError>{errors.expYear}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.cvc)}>
            <FieldLabel htmlFor="cvc">CVC</FieldLabel>
            <Input
              id="cvc"
              name="cvc"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              maxLength={4}
              className="h-9"
              value={values.cvc}
              onChange={(event) =>
                onChange("cvc", event.target.value.replace(/\D/g, ""))
              }
              aria-invalid={Boolean(errors.cvc)}
            />
            <FieldError>{errors.cvc}</FieldError>
          </Field>
        </div>

        <FieldSet className="gap-2">
          <FieldLegend variant="label" className="mb-0">
            Billing address
          </FieldLegend>
          <FieldDescription>
            Required by the card issuer for verification.
          </FieldDescription>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.billingName)}>
              <FieldLabel htmlFor="billingName">Full name</FieldLabel>
              <Input
                id="billingName"
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

            <Field data-invalid={Boolean(errors.billingEmail)}>
              <FieldLabel htmlFor="billingEmail">Email</FieldLabel>
              <Input
                id="billingEmail"
                name="billingEmail"
                type="email"
                autoComplete="email"
                placeholder="juan@example.com"
                className="h-9"
                value={values.billingEmail}
                onChange={(event) =>
                  onChange("billingEmail", event.target.value)
                }
                aria-invalid={Boolean(errors.billingEmail)}
              />
              <FieldError>{errors.billingEmail}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.billingPhone)}>
              <FieldLabel htmlFor="billingPhone">Phone</FieldLabel>
              <Input
                id="billingPhone"
                name="billingPhone"
                type="tel"
                autoComplete="tel"
                placeholder="09171234567"
                className="h-9"
                value={values.billingPhone}
                onChange={(event) =>
                  onChange("billingPhone", event.target.value)
                }
                aria-invalid={Boolean(errors.billingPhone)}
              />
              <FieldError>{errors.billingPhone}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.billingAddress)}>
              <FieldLabel htmlFor="billingAddress">Street address</FieldLabel>
              <Input
                id="billingAddress"
                name="billingAddress"
                autoComplete="street-address"
                placeholder="123 Main Street"
                className="h-9"
                value={values.billingAddress}
                onChange={(event) =>
                  onChange("billingAddress", event.target.value)
                }
                aria-invalid={Boolean(errors.billingAddress)}
              />
              <FieldError>{errors.billingAddress}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.billingCity)}>
              <FieldLabel htmlFor="billingCity">City</FieldLabel>
              <Input
                id="billingCity"
                name="billingCity"
                autoComplete="address-level2"
                placeholder="Manila"
                className="h-9"
                value={values.billingCity}
                onChange={(event) =>
                  onChange("billingCity", event.target.value)
                }
                aria-invalid={Boolean(errors.billingCity)}
              />
              <FieldError>{errors.billingCity}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.billingState)}>
              <FieldLabel htmlFor="billingState">State / region</FieldLabel>
              <Input
                id="billingState"
                name="billingState"
                autoComplete="address-level1"
                placeholder="Metro Manila"
                className="h-9"
                value={values.billingState}
                onChange={(event) =>
                  onChange("billingState", event.target.value)
                }
                aria-invalid={Boolean(errors.billingState)}
              />
              <FieldError>{errors.billingState}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.billingPostalCode)}>
              <FieldLabel htmlFor="billingPostalCode">Postal code</FieldLabel>
              <Input
                id="billingPostalCode"
                name="billingPostalCode"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="1000"
                maxLength={4}
                className="h-9"
                value={values.billingPostalCode}
                onChange={(event) =>
                  onChange(
                    "billingPostalCode",
                    event.target.value.replace(/\D/g, ""),
                  )
                }
                aria-invalid={Boolean(errors.billingPostalCode)}
              />
              <FieldError>{errors.billingPostalCode}</FieldError>
            </Field>
          </div>
        </FieldSet>
      </FieldGroup>
    </div>
  );
}
