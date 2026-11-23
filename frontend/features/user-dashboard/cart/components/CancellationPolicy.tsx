import {Banknote, CalendarClock, CirclePercent} from "lucide-react";
import {reservationCancellationPolicy} from "../cancellation-policy";
import {CheckoutInstructions} from "./CheckoutInstructions";

const reservationCancellationInstruction = {
  icon: Banknote,
  title: reservationCancellationPolicy.title,
  description: (
    <>
      {reservationCancellationPolicy.lead}{" "}
      <strong className="font-semibold text-secondary">{reservationCancellationPolicy.rule}</strong>.
    </>
  ),
};

export function CancellationPolicy({reservationOnly = false}: {reservationOnly?: boolean}) {
  return (
    <CheckoutInstructions
      title="Reservation and cancellation policy"
      instructions={reservationOnly ? [reservationCancellationInstruction] : [
        {
          icon: CalendarClock,
          title: "Pay within 24 hours",
          description: <>Cash and online reservations must be paid <strong className="font-semibold text-secondary">within 24 hours of placing your order</strong>. Unpaid reservations will be automatically cancelled.</>,
        },
        reservationCancellationInstruction,
        {
          icon: CirclePercent,
          title: "Fully paid orders",
          description: <>Cancellations made <strong className="font-semibold text-secondary">5 days or more after full payment</strong> are eligible for a <strong className="font-semibold text-secondary">50% refund</strong>.</>,
        },
      ]}
    />
  );
}
