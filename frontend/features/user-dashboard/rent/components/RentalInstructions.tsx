import {AlarmClock, CalendarClock, HeartHandshake, ShieldAlert} from "lucide-react";
import type {LucideIcon} from "lucide-react";
import {RENTAL_RETURN_WINDOW_DAYS} from "@/lib/rental";
import {CheckoutSection} from "@/features/user-dashboard/cart/components/CheckoutSection";

type RentalInstruction = {
  icon: LucideIcon;
  description: string;
};

export function RentalInstructions() {
  const instructions: RentalInstruction[] = [
    {
      icon: HeartHandshake,
      description:
        "Please handle the outfit with care and return it in the same condition as when it was picked up.",
    },
    {
      icon: CalendarClock,
      description: `Your return date is set to ${RENTAL_RETURN_WINDOW_DAYS} days after your event date. Please return the outfit by then.`,
    },
    {
      icon: AlarmClock,
      description:
        "Late return penalty fees will apply if the outfit is returned after the agreed return date or time.",
    },
    {
      icon: ShieldAlert,
      description:
        "Damage fees may apply if the outfit is returned with damage beyond normal wear and tear.",
    },
  ];

  return (
    <CheckoutSection title="Rental instructions">
      <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {instructions.map(({icon: Icon, description}) => (
          <li
            key={description}
            className="flex items-start gap-3 text-secondary"
          >
            <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <p className="text-sm leading-relaxed">{description}</p>
          </li>
        ))}
      </ul>
    </CheckoutSection>
  );
}
