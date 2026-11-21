"use client";

import {useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {cn} from "@/lib/utils";
import coloredLogo from "@/assets/business-logo/Colored-logo.png";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {PhoneInput} from "@/components/ui/phone-input";
import type {IUserRegister} from "@/features/auth/types/IUser";
import type {RegisterFieldErrors} from "@/features/auth/utils/validators";
import {PasswordGuide} from "./password-guide";
import {Eye, EyeOff} from "lucide-react";

interface SignupFormProps extends Omit<
  React.ComponentProps<"div">,
  "onSubmit"
> {
  formData: IUserRegister;
  error?: string;
  fieldErrors?: RegisterFieldErrors;
  isLoading?: boolean;
  acceptedTerms: boolean;
  onAcceptedTermsChange: (checked: boolean) => void;
  onFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function SignupForm({
  className,
  formData,
  error,
  fieldErrors = {},
  isLoading,
  acceptedTerms,
  onAcceptedTermsChange,
  onFormChange,
  onPhoneChange,
  onSubmit,
  ...props
}: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <div className="space-y-4">
          <Link href="/" className="flex items-center" aria-label="Morena home">
            <Image
              src={coloredLogo}
              alt="Morena"
              priority
              className="h-10 w-auto"
            />
          </Link>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your details to start renting with Morena.
            </p>
          </div>
        </div>

        <FieldGroup>
          <Field className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.firstName)}>
              <FieldLabel htmlFor="firstName">First Name</FieldLabel>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Juan"
                value={formData.firstName}
                onChange={onFormChange}
                className="h-10"
                aria-invalid={Boolean(fieldErrors.firstName)}
                required
              />
              <FieldError>{fieldErrors.firstName}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.lastName)}>
              <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Dela Cruz"
                value={formData.lastName}
                onChange={onFormChange}
                className="h-10"
                aria-invalid={Boolean(fieldErrors.lastName)}
                required
              />
              <FieldError>{fieldErrors.lastName}</FieldError>
            </Field>
          </Field>

          <Field data-invalid={Boolean(fieldErrors.email)}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="johndoe@email.com"
              value={formData.email}
              onChange={onFormChange}
              className="h-10"
              aria-invalid={Boolean(fieldErrors.email)}
              required
            />
            <FieldError>{fieldErrors.email}</FieldError>
          </Field>

          <Field className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(fieldErrors.phoneNumber)}>
              <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
              <PhoneInput
                id="phoneNumber"
                name="phoneNumber"
                placeholder="917 123 4567"
                value={formData.phoneNumber}
                onChange={onPhoneChange}
                className="h-10"
                aria-invalid={Boolean(fieldErrors.phoneNumber)}
                required
              />
              <FieldError>{fieldErrors.phoneNumber}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="gender">Gender</FieldLabel>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={onFormChange}
                required
                className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <option value="" disabled>
                  Select gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
          </Field>

          <Field data-invalid={Boolean(fieldErrors.dateOfBirth)}>
            <FieldLabel htmlFor="dateOfBirth">Date of Birth</FieldLabel>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={onFormChange}
              className="h-10"
              aria-invalid={Boolean(fieldErrors.dateOfBirth)}
              max={new Date().toISOString().split("T")[0]}
              required
            />
            <FieldError>{fieldErrors.dateOfBirth}</FieldError>
            <FieldDescription>
              You must be at least 18 years old to sign up.
            </FieldDescription>
          </Field>

          <Field data-invalid={Boolean(fieldErrors.password)}>
            <FieldLabel htmlFor="rawPassword">Password</FieldLabel>
            <div className="relative">
              <Input
                id="rawPassword"
                name="rawPassword"
                type={showPassword ? "text" : "password"}
                value={formData.rawPassword}
                onChange={onFormChange}
                className="h-10 pr-10"
                aria-invalid={Boolean(fieldErrors.password)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            <FieldError>{fieldErrors.password}</FieldError>
            <PasswordGuide password={formData.rawPassword} className="pt-1" />
          </Field>

          <Field data-invalid={Boolean(fieldErrors.confirmPassword)}>
            <FieldLabel htmlFor="confirmPassword">
              Confirm Password
            </FieldLabel>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={onFormChange}
              className="h-10 pr-10"
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              required
            />
            <FieldError>{fieldErrors.confirmPassword}</FieldError>
          </Field>

          {error ? (
            <FieldError className="text-sm">{error}</FieldError>
          ) : null}

          <Field>
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="acceptedTerms"
                checked={acceptedTerms}
                onCheckedChange={(value) =>
                  onAcceptedTermsChange(value === true)
                }
                className="mt-0.5"
                aria-required
              />
              <label
                htmlFor="acceptedTerms"
                className="text-sm leading-relaxed text-muted-foreground"
              >
                I have read and agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-2"
                >
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-2"
                >
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
          </Field>

          <Field>
            <Button
              type="submit"
              className="h-10 w-full"
              disabled={isLoading || !acceptedTerms}
            >
              {isLoading ? "Creating account…" : "Create Account"}
            </Button>
          </Field>
        </FieldGroup>

        <FieldDescription>
          Already have an account? <a href="/login">Sign in</a>
        </FieldDescription>
        <FieldDescription>
          <Link href="/dashboard/browse">Browse without an account</Link>
        </FieldDescription>
      </form>
    </div>
  );
}
