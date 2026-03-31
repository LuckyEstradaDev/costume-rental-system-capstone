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

export type AboutStat = {
  value: string;
  label: string;
};

export type AboutImage = {
  src: string;
  alt: string;
};

export const aboutUsData = {
  title: "About Us",
  description:
    "We are dedicated to making fashion accessible, offering gowns, suits, and costumes that you can rent or buy, all backed by tailoring and care services.",
  heading: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
  body: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
  stats: [
    {value: "240", label: "Outfits to Choose From"},
    {value: "5k+", label: "Happy Clients"},
    {value: "8", label: "Years of Service"},
  ] as AboutStat[],
  images: [
    {
      src: "/assets/images/landing-page/gown.jpg",
      alt: "Detailed purple gown",
    },
    {
      src: "/assets/images/landing-page/suit.jpg",
      alt: "Formal suits on display",
    },
  ] as AboutImage[],
};
