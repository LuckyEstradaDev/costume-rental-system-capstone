"use client";

import {CartEmpty} from "@/features/user-dashboard/cart/CartEmpty";
import {CartList} from "@/features/user-dashboard/cart/CartList";
import {CartSummary} from "@/features/user-dashboard/cart/CartSummary";
import {useState} from "react";

// Static mock data for preview
const MOCK_CART_ITEMS = [
  {
    id: "1",
    name: "Classic Tuxedo",
    category: "Formal Wear",
    price: 89.99,
    quantity: 1,
    imageURL: "/assets/images/landing-page/suit.jpg",
    size: "M",
    color: "Black",
  },
  {
    id: "2",
    name: "Victorian Ball Gown",
    category: "Period Dress",
    price: 129.99,
    quantity: 1,
    imageURL: "/assets/images/landing-page/suit.jpg",
    size: "L",
    color: "Red",
  },
  {
    id: "3",
    name: "Superhero Cape Bundle",
    category: "Character",
    price: 49.99,
    quantity: 2,
    imageURL: "/assets/images/landing-page/suit.jpg",
    size: "One Size",
    color: "Assorted",
  },
];

export default function CartPage() {
  // TODO: Replace with actual cart data from API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cartItems, setCartItems] = useState<any[]>(MOCK_CART_ITEMS);
  const isEmpty = cartItems.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Cart</h1>
        <p className="mt-1 text-muted-foreground">Manage your rental items</p>
      </div>

      {isEmpty ? (
        <CartEmpty />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CartList items={cartItems} />
          </div>
          <div>
            <CartSummary items={cartItems} />
          </div>
        </div>
      )}
    </div>
  );
}
