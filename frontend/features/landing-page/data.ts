import {
  CalendarDays,
  Gem,
  Medal,
  QrCode,
  Scissors,
  ShoppingCart,
  TicketCheck,
} from "lucide-react";

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
  ],
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
  items: [
    {
      title: "Black Coat For Men",
      category: "Man Suit",
      price: "₱450",
      image: "/assets/images/landing-page/suit.jpg",
    },
    {
      title: "Black Coat For Men",
      category: "Man Suit",
      price: "₱450",
      image: "/assets/images/landing-page/suit.jpg",
    },
    {
      title: "Black Coat For Men",
      category: "Man Suit",
      price: "₱450",
      image: "/assets/images/landing-page/suit.jpg",
    },
    {
      title: "Black Coat For Men",
      category: "Man Suit",
      price: "₱450",
      image: "/assets/images/landing-page/suit.jpg",
    },
  ],
};

export const testimonialsData = {
  title: "What Our Customers Say",
  description:
    "Real stories from people who found their perfect look with us, whether for weddings, galas, or everyday celebrations.",
  items: [
    {
      name: "Samantha Payne",
      handle: "@SamPayne90",
      verified: "Verified Purchase",
      rating: "★★★★★",
      message:
        "Lorem ipsum dolor sit amet consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna.",
      date: "23 Nov 2021",
    },
    {
      name: "Samantha Payne",
      handle: "@SamPayne90",
      verified: "Verified Purchase",
      rating: "★★★★★",
      message:
        "Lorem ipsum dolor sit amet consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna.",
      date: "23 Nov 2021",
    },
    {
      name: "Samantha Payne",
      handle: "@SamPayne90",
      verified: "Verified Purchase",
      rating: "★★★★★",
      message:
        "Lorem ipsum dolor sit amet consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna.",
      date: "23 Nov 2021",
    },
    {
      name: "Samantha Payne",
      handle: "@SamPayne90",
      verified: "Verified Purchase",
      rating: "★★★★★",
      message:
        "Lorem ipsum dolor sit amet consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna.",
      date: "23 Nov 2021",
    },
  ],
};

export const footerData = {
  brand: "Morena",
  tagline:
    "Elegant outfits for every moment. Rent, buy, and tailor with confidence.",
  contact: {
    phone: "+63 912 345 6789",
    email: "hello@morena.ph",
    address: "Quezon City, Metro Manila",
  },
  sections: [
    {
      title: "Menu",
      links: ["Home", "About Us", "Outfits", "Reviews", "Contacts", "Services"],
    },
    {
      title: "Services",
      links: ["Rent", "Sell", "Tailor", "Cleaning"],
    },
    {
      title: "Support",
      links: ["Help Center", "FAQs", "Contact Us"],
    },
  ],
  socials: ["Facebook", "Instagram", "TikTok"],
  copyright: "2026 Morena. All rights reserved.",
};
