import type {LucideIcon} from "lucide-react";
import {Gem, Medal, QrCode, TicketCheck} from "lucide-react";

export type ValuePropositionItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const valuePropositionItems: ValuePropositionItem[] = [
  {
    title: "Flexibility of Choice",
    description:
      "Customers can decide whether to rent for a single event or buy to keep, giving them complete control over how they access fashion.",
    icon: QrCode,
  },
  {
    title: "Affordable Elegance",
    description:
      "High-quality gowns, tuxedos, suits, and costumes are available at a fraction of retail prices, making luxury looks accessible to everyone.",
    icon: Gem,
  },
  {
    title: "Convenience and Reliability",
    description:
      "Easy browsing, secure checkout, and streamlined delivery or pickup options ensure a stress-free experience from selection to wearing.",
    icon: TicketCheck,
  },
  {
    title: "Curated Variety",
    description:
      "A wide catalog of styles, sizes, and themes caters to weddings, galas, theater, and casual events, so users always find the right outfit for the occasion.",
    icon: Medal,
  },
];
