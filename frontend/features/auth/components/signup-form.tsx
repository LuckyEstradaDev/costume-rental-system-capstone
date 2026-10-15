"use client";

import {useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import type {IUserRegister} from "@/features/auth/types/IUser";
import {Eye, EyeOff} from "lucide-react";

interface SignupFormProps extends Omit<
  React.ComponentProps<"div">,
  "onSubmit"
> {
  formData: IUserRegister;
  error?: string;
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
  isLoading,
  onFormChange,
  onSubmit,
  ...props
}: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden rounded-lg p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="flex flex-col justify-center gap-6 p-6 md:p-10"
            onSubmit={onSubmit}
          >
            <div className="space-y-4">
              <Link
                href="/"
                className="flex items-center gap-2 md:hidden"
                aria-label="Morena home"
              >
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
                <Field>
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Juan"
                    value={formData.firstName}
                    onChange={onFormChange}
                    className="h-10"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Dela Cruz"
                    value={formData.lastName}
                    onChange={onFormChange}
                    className="h-10"
                    required
                  />
                </Field>
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={onFormChange}
                  className="h-10"
                  required
                />
              </Field>

              <Field className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="09171234567"
                    value={formData.phoneNumber}
                    onChange={onFormChange}
                    className="h-10"
                    required
                  />
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

              <Field>
                <FieldLabel htmlFor="rawPassword">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="rawPassword"
                    name="rawPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.rawPassword}
                    onChange={onFormChange}
                    className="h-10 pr-10"
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
              </Field>

              <Field>
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
                  required
                />
                <FieldDescription>
                  Use at least 8 characters for better account security.
                </FieldDescription>
              </Field>

              {error ? (
                <FieldDescription className="text-destructive">
                  {error}
                </FieldDescription>
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

          <div className="relative isolate hidden overflow-hidden bg-primary text-primary-foreground md:flex md:flex-col md:justify-between md:p-10">
            <Image
              src="/assets/images/landing-page/hero-bg.jpg"
              alt="Wedding and formal outfits on hangers"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/25" />
            <div className="relative flex items-center gap-2">
              <span className="size-7 rounded-full bg-primary-foreground" />
              <span className="text-xl font-bold tracking-tight">Morena</span>
            </div>
            <div className="relative space-y-4">
              <p className="text-3xl leading-tight font-semibold text-balance">
                Start your Morena wardrobe.
              </p>
              <p className="max-w-xs text-sm text-primary-foreground/70">
                Create an account to browse, book, and rent from our curated
                collection.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
