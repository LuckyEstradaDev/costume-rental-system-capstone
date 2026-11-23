import type {LucideIcon} from "lucide-react";
import type {ReactNode} from "react";
import {cn} from "@/lib/utils";
import {CheckoutSection} from "./CheckoutSection";

type CheckoutInstruction = {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
};

export function CheckoutInstructions({
  title,
  instructions,
}: {
  title: string;
  instructions: CheckoutInstruction[];
}) {
  return (
    <CheckoutSection title={title}>
      <ul className={cn("grid gap-x-8 gap-y-6", instructions.length > 1 && "md:grid-cols-2")}>
        {instructions.map(({icon: Icon, title: itemTitle, description}) => (
          <li key={itemTitle} className="flex items-start gap-3">
            <Icon className="mt-0.5 size-6 shrink-0 text-accent" aria-hidden="true" />
            <div className="min-w-0">
              <h3 className="text-base font-semibold leading-relaxed text-primary">
                {itemTitle}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-secondary">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </CheckoutSection>
  );
}
