"use client";

import {useState} from "react";
import Link from "next/link";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
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
  onFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function SignupForm({
  className,
  formData,
  error,
  fieldErrors = {},
  isLoading,
  onFormChange,
  onSubmit,
  ...props
}: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2" aria-label="Morena home">
            <span className="size-6 rounded-full bg-primary" />
            <span className="text-lg font-bold text-primary">Morena</span>
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
              placeholder="m@example.com"
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
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="09171234567"
                value={formData.phoneNumber}
                onChange={onFormChange}
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
                <option value="prefer_not_to_say">Prefer not to say</option>
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
            <Button
              type="submit"
              className="h-10 w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating account…" : "Create Account"}
            </Button>
          </Field>
        </FieldGroup>

        <FieldDescription>
          Already have an account? <a href="/login">Sign in</a>
        </FieldDescription>
      </form>
    </div>
  );
}
