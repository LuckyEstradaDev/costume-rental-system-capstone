"use client";

import {Check} from "lucide-react";
import {cn} from "@/lib/utils";
import type {WizardStep} from "../providers/PackageProvider";

const STEPS: {key: WizardStep; label: string; number: number}[] = [
  {key: "outfit", label: "Outfit", number: 1},
  {key: "color", label: "Color", number: 2},
  {key: "size", label: "Size", number: 3},
  {key: "amount", label: "Amount", number: 4},
];

const STEP_ORDER: WizardStep[] = ["outfit", "color", "size", "amount"];

function getStepIndex(step: WizardStep): number {
  return STEP_ORDER.indexOf(step);
}

export function StepIndicator({currentStep}: {currentStep: WizardStep}) {
  const activeIndex = getStepIndex(currentStep);

  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, index) => {
        const isCompleted = index < activeIndex;
        const isActive = index === activeIndex;
        const isFuture = index > activeIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  isCompleted &&
                    "border-green-500 bg-green-500 text-white",
                  isActive &&
                    "border-primary bg-primary text-primary-foreground",
                  isFuture &&
                    "border-border bg-background text-muted-foreground",
                )}
              >
                {isCompleted ? <Check className="size-4" /> : step.number}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive && "text-foreground",
                  isCompleted && "text-green-600",
                  isFuture && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 mb-5 h-0.5 w-12 sm:w-20",
                  index < activeIndex ? "bg-green-500" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
