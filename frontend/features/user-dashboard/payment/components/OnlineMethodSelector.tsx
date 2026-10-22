"use client";

import {useId} from "react";
import Image, {type StaticImageData} from "next/image";
import cardLogo from "@/assets/payment_logos/mastercard-alt.svg";
import gcashLogo from "@/assets/payment_logos/gcash_logo.png";
import mayaLogo from "@/assets/payment_logos/maya_logo.png";
import qrphLogo from "@/assets/payment_logos/qrph_logo.png";
import {cn} from "@/lib/utils";
import {
  METHOD_LABELS,
  ONLINE_PAYMENT_METHODS,
  type OnlinePaymentMethod,
} from "../types/IPaymongo";

const METHOD_LOGOS: Record<OnlinePaymentMethod, StaticImageData> = {
  card: cardLogo,
  gcash: gcashLogo,
  paymaya: mayaLogo,
  qrph: qrphLogo,
};

const LOGO_HEIGHTS: Record<OnlinePaymentMethod, string> = {
  card: "h-12",
  gcash: "h-14",
  paymaya: "h-7",
  qrph: "h-7",
};

const DISABLED_METHODS: OnlinePaymentMethod[] = ["card", "gcash", "paymaya"];

type OnlineMethodSelectorProps = {
  method: OnlinePaymentMethod;
  onMethodChange: (method: OnlinePaymentMethod) => void;
};

export function OnlineMethodSelector({
  method,
  onMethodChange,
}: OnlineMethodSelectorProps) {
  const groupName = useId();

  return (
    <div
      role="radiogroup"
      aria-label="Online payment method"
      className="grid grid-cols-2 gap-2 sm:grid-cols-4"
    >
      {ONLINE_PAYMENT_METHODS.map((value) => {
        const logo = METHOD_LOGOS[value];
        const isDisabled = DISABLED_METHODS.includes(value);
        const isActive = method === value && !isDisabled;

        return (
          <label
            key={value}
            className={cn(
              "relative flex h-20 items-center justify-center rounded-lg border p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50",
              isDisabled
                ? "cursor-not-allowed border-border bg-background opacity-50 grayscale"
                : isActive
                  ? "cursor-pointer border-border bg-primary/5"
                  : "cursor-pointer border-border bg-background hover:bg-muted/40",
            )}
          >
            <input
              type="radio"
              name={groupName}
              value={value}
              checked={isActive}
              disabled={isDisabled}
              onChange={() => onMethodChange(value)}
              aria-label={METHOD_LABELS[value]}
              className="sr-only"
            />
            <Image
              src={logo}
              alt=""
              width={logo.width}
              height={logo.height}
              unoptimized
              className={cn(
                "w-auto max-w-full object-contain",
                LOGO_HEIGHTS[value],
              )}
            />
          </label>
        );
      })}
    </div>
  );
}
