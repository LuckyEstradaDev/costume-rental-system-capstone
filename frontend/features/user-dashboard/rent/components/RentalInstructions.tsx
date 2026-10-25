import {AlarmClock, CalendarClock, HeartHandshake, Info, ShieldAlert} from "lucide-react";
import type {LucideIcon} from "lucide-react";
import {RENTAL_RETURN_WINDOW_DAYS} from "@/lib/rental";

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
    <div className="rounded-lg border border-border p-4">
      <span className="inline-flex items-center gap-2 text-[17px] font-semibold tracking-tight text-primary">
        <Info className="size-4 text-primary" />
        Rental Instructions
      </span>

      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {instructions.map(({icon: Icon, description}) => (
          <li
            key={description}
            className="flex h-full flex-col items-center gap-3 rounded-lg border border-primary bg-primary p-4 text-center text-white"
          >
            <Icon className="size-5 shrink-0 text-white" aria-hidden="true" />
            <p className="text-sm text-white">{description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
