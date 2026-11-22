import {Banknote, CalendarClock, CirclePercent} from "lucide-react";
import {CheckoutInstructions} from "./CheckoutInstructions";

export function CancellationPolicy() {
  return (
    <CheckoutInstructions
      title="Reservation and cancellation policy"
      instructions={[
        {
          icon: CalendarClock,
          title: "Pay within 24 hours",
          description: <>Cash and online reservations must be paid <strong className="font-semibold text-secondary">within 24 hours of placing your order</strong>. Unpaid reservations will be automatically cancelled.</>,
        },
        {
          icon: Banknote,
          title: "Reservation cancellations",
          description: <>Cancellations made <strong className="font-semibold text-secondary">5 days or more after reservation are non-refundable</strong>.</>,
        },
        {
          icon: CirclePercent,
          title: "Fully paid orders",
          description: <>Cancellations made <strong className="font-semibold text-secondary">5 days or more after full payment</strong> are eligible for a <strong className="font-semibold text-secondary">50% refund</strong>.</>,
        },
      ]}
    />
  );
}
