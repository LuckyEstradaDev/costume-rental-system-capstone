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
import {IUserLogin} from "@/features/auth/types/IUser";
import {Eye, EyeOff} from "lucide-react";

interface LoginFormProps extends Omit<React.ComponentProps<"div">, "onSubmit"> {
  formData: IUserLogin;
  error?: string;
  isLoading?: boolean;
  onFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function LoginForm({
  className,
  formData,
  error,
  onFormChange,
  isLoading,
  onSubmit,
  ...props
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden rounded-lg p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            onSubmit={onSubmit}
            className="flex flex-col justify-center gap-6 p-6 md:p-10"
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
                  Welcome back
                </h1>
                <p className="text-sm text-muted-foreground">
                  Log in to manage your gown and barong rentals.
                </p>
              </div>
            </div>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={onFormChange}
                  placeholder="Email address"
                  className="h-10"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    name="password"
                    value={formData.password}
                    onChange={onFormChange}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="h-10 pr-10"
                    placeholder="Password"
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
                  {isLoading ? "Logging in…" : "Login"}
                </Button>
              </Field>
            </FieldGroup>
            <FieldDescription>
              Don&apos;t have an account? <a href="/register">Sign up</a>
            </FieldDescription>
          </form>

          <div className="relative isolate hidden overflow-hidden bg-primary text-primary-foreground md:flex md:flex-col md:justify-between md:p-10">
            <Image
              src="/assets/images/landing-page/suit.jpg"
              alt="Tailored suit from the Morena collection"
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
                Gowns and barongs for every celebration.
              </p>
              <p className="max-w-xs text-sm text-primary-foreground/70">
                Browse the collection and rent the pieces that fit your moment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
