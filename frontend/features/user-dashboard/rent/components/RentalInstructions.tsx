import {AlarmClock, CalendarClock, HeartHandshake, ShieldAlert} from "lucide-react";
import {RENTAL_RETURN_WINDOW_DAYS} from "@/lib/rental";
import {CheckoutInstructions} from "@/features/user-dashboard/cart/components/CheckoutInstructions";

export function RentalInstructions() {
  const instructions = [
    {
      icon: HeartHandshake,
      title: "Handle your outfit with care",
      description:
        "Please handle the outfit with care and return it in the same condition as when it was picked up.",
    },
    {
      icon: CalendarClock,
      title: "Return on time",
      description: `Your return date is set to ${RENTAL_RETURN_WINDOW_DAYS} days after your event date. Please return the outfit by then.`,
    },
    {
      icon: AlarmClock,
      title: "Overdue penalty",
      description:
        <>
          A penalty applies when an outfit is returned after the agreed return date or time.
          <strong className="mt-2 block text-base font-semibold text-secondary">
            Purchase price − rental price = overdue penalty
          </strong>
        </>,
    },
    {
      icon: ShieldAlert,
      title: "Damage penalty",
      description:
        <>
          A penalty applies for damage beyond normal wear and tear.
          <strong className="mt-2 block text-base font-semibold text-secondary">
            Purchase price − rental price = damage penalty
          </strong>
        </>,
    },
  ];

  return (
    <CheckoutInstructions title="Rental instructions" instructions={instructions} />
  );
}
