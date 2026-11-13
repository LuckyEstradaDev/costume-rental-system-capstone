"use client";

import * as React from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const PH_PHONE_PREFIX = "+63";
const PH_PHONE_DIGITS = 10;

/**
 * Reduces any PH mobile value to the 10 national digits after +63, so pasted
 * `0917...`, `63917...`, and `+63917...` all land on the same value.
 */
const toLocalDigits = (value: string): string => {
  if (value.startsWith(PH_PHONE_PREFIX)) {
    return value
      .slice(PH_PHONE_PREFIX.length)
      .replace(/\D/g, "")
      .slice(0, PH_PHONE_DIGITS);
  }

  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("63") && digits.length > PH_PHONE_DIGITS) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, PH_PHONE_DIGITS);
};

/** Canonical storage form: `+639XXXXXXXXX`, or `""` when there are no digits. */
export const toCanonicalPHPhone = (value: string): string => {
  const digits = toLocalDigits(value);
  return digits ? `${PH_PHONE_PREFIX}${digits}` : "";
};

interface PhoneInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: string;
  onChange: (value: string) => void;
}

/** PH mobile input with a fixed +63 prefix; stored as `+639XXXXXXXXX`. */
export function PhoneInput({
  className,
  value,
  onChange,
  ...props
}: PhoneInputProps) {
  const digits = toLocalDigits(value);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(toCanonicalPHPhone(event.target.value));
  };

  return (
    <InputGroup className={className}>
      <InputGroupAddon>{PH_PHONE_PREFIX}</InputGroupAddon>
      <InputGroupInput
        {...props}
        className="h-full"
        type="tel"
        inputMode="numeric"
        autoComplete={props.autoComplete ?? "tel-national"}
        value={digits}
        onChange={handleChange}
      />
    </InputGroup>
  );
}
