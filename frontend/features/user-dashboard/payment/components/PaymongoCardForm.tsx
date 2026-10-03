"use client";

import {CreditCard, Lock} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
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

export type CardFormValues = {
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

export type CardFormField = keyof CardFormValues;

const MONTHS = [
  "01", "02", "03", "04", "05", "06",
  "07", "08", "09", "10", "11", "12",
];

const CURRENT_YEAR = new Date().getFullYear();

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

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
    <Card className={cn("gap-2 rounded-lg border-border bg-card py-3", className)}>
      <CardHeader className="flex-row items-center gap-2 space-y-0 px-3">
        <CardTitle className="flex items-center gap-1.5 text-sm">
          <CreditCard className="size-3.5 text-primary" />
          Card details
        </CardTitle>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-100">
          <Lock className="size-2.5" />
          Secure
        </span>
      </CardHeader>

      <CardContent className="px-3">
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
              className="font-mono tracking-wider"
              value={values.cardNumber}
              onChange={(event) =>
                onChange("cardNumber", formatCardNumber(event.target.value))
              }
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
                <SelectTrigger id="expMonth" className="w-full">
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
                <SelectTrigger id="expYear" className="w-full">
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
                value={values.cvc}
                onChange={(event) =>
                  onChange("cvc", event.target.value.replace(/\D/g, ""))
                }
                aria-invalid={Boolean(errors.cvc)}
              />
              <FieldError>{errors.cvc}</FieldError>
            </Field>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Billing address — required by the card issuer for verification.
          </p>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.billingName)}>
              <FieldLabel htmlFor="billingName">Full name</FieldLabel>
              <Input
                id="billingName"
                name="billingName"
                autoComplete="cc-name"
                placeholder="Juan dela Cruz"
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
        </FieldGroup>
      </CardContent>
    </Card>
  );
}