"use client";

import {Check, X} from "lucide-react";
import {cn} from "@/lib/utils";

const PASSWORD_RULES = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  {
    id: "uppercase",
    label: "One uppercase letter",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: "special",
    label: "One special character (!@#$%…)",
    test: (password: string) =>
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password),
  },
] as const;

/**
 * Live password requirements list. Rules sit muted until typing starts, then
 * flip to green with a check (pass) or red with a cross (fail).
 */
export function PasswordGuide({
  password,
  className,
}: {
  password: string;
  className?: string;
}) {
  const started = password.length > 0;

  return (
    <ul className={cn("space-y-1", className)} aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const passed = started && rule.test(password);
        const failed = started && !passed;

        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center justify-between gap-2 text-xs",
              !started && "text-muted-foreground",
              passed && "text-green-600 dark:text-green-400",
              failed && "text-destructive",
            )}
          >
            <span>{rule.label}</span>
            {started &&
              (passed ? (
                <Check className="size-3.5 shrink-0" aria-hidden />
              ) : (
                <X className="size-3.5 shrink-0" aria-hidden />
              ))}
          </li>
        );
      })}
    </ul>
  );
}
