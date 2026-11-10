import {
  CalendarDays,
  Gem,
  Medal,
  QrCode,
  Scissors,
  ShoppingCart,
  TicketCheck,
} from "lucide-react";

export const facebookUrl =
  "https://www.facebook.com/gownsandbarongbyMorena";

export const navItems = [
  {label: "Home", href: "/#home"},
  {label: "About Us", href: "/#about"},
  {label: "Services", href: "/#services"},
  {label: "Outfits", href: "/#outfits"},
  {label: "Reviews", href: "/#reviews"},
  {label: "Contacts", href: "/#contacts"},
];

export const valuePropositionItems = [
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
      "Easy browsing, secure checkout, and streamlined pickup options ensure a stress-free experience from selection to wearing.",
    icon: TicketCheck,
  },
  {
    title: "Curated Variety",
    description:
      "A wide catalog of styles, sizes, and themes caters to weddings, galas, theater, and casual events, so users always find the right outfit for the occasion.",
    icon: Medal,
  },
];

export const aboutUsData = {
  title: "About Us",
  description:
    "We are dedicated to making fashion accessible, offering gowns, suits, and costumes that you can rent or buy, all backed by tailoring and care services.",
  heading: "Dressing Naic for every milestone since 2018.",
  body: "Morena's Gowns and Barong is a family-run rental and tailoring shop in Naic, Cavite. From weddings and debuts to graduations and pageants, we help clients find the right gown, barong, suit, or costume for the occasion. Whether you choose to rent for a single event or buy a piece to keep, our team supports you with fitting, alterations, and styling at our P. Poblete and Stadium branches.",
  foundingYear: 2018,
  images: [
    {
      src: "/assets/images/landing-page/gown.jpg",
      alt: "Detailed purple gown",
    },
    {
      src: "/assets/images/landing-page/suit.jpg",
      alt: "Formal suits on display",
    },
  ],
};

export const servicesData = {
  title: "Our Services",
  description:
    "From renting to owning, tailoring to cleaning, we provide everything you need to look your best and keep your outfits in perfect condition.",
  items: [
    {
      title: "Sell",
      description:
        "Purchase curated gowns, suits, and event outfits when you want a look to keep beyond a single occasion.",
      icon: ShoppingCart,
    },
    {
      title: "Rent",
      description:
        "Browse a wide catalog of gowns, tuxedos, suits, and costumes available for short-term use. Perfect for weddings, galas, theater, or one-time events.",
      icon: CalendarDays,
    },
    {
      title: "Tailor",
      description:
        "Get alteration support for better comfort and fit, so every piece feels custom-made before your event.",
      icon: Scissors,
    },
  ],
};

export const topOutfitsData = {
  title: "Top Outfits",
  description:
    "Discover our most popular gowns, tuxedos, suits, and costumes chosen by customers for their style, quality, and versatility.",
  ctaText: "View More",
};

export const testimonialsData = {
  title: "What Our Customers Say",
  description:
    "Real stories from people who found their perfect look with us, whether for weddings, galas, or everyday celebrations.",
};

export const contactData = {
  title: "Contact Us",
  description:
    "Reach out for rentals, purchases, tailoring, or any questions about our collections.",
  heading: "Visit our studio or get in touch anytime",
  body: "We're here to help you find the perfect look for your next event with quick support and easy booking.",
  hours: "Open daily • 9:00 AM – 8:00 PM",
  locations: [
    {
      name: "P. Poblete Main Branch",
      place: "Morena's Dress Shop",
      address: "8QC8+RWW, P. Poblete St, Naic, Cavite",
      mapEmbed:
        "https://www.google.com/maps?q=14.322186202473544,120.76741987442054&z=17&output=embed",
      mapUrl:
        "https://www.google.com/maps/search/?api=1&query=14.322186202473544,120.76741987442054",
    },
    {
      name: "Stadium Branch",
      place: "Morena's Gown and Barong Rental",
      address: "Stadium, Naic, Cavite",
      mapEmbed:
        "https://www.google.com/maps?q=14.3270041,120.7746765&z=17&output=embed",
      mapUrl: "https://maps.app.goo.gl/zmJJ5nzH98tF4gMz5",
    },
  ],
};

export const footerData = {
  brand: "Morena",
  tagline:
    "Elegant outfits for every moment. Rent, buy, and tailor with confidence.",
  copyright: "2026 Morena. All rights reserved.",
};
