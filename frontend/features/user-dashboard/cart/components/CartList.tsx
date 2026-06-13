"use client";

import type React from "react";
import {Card} from "@/components/ui/card";
import {CartItem} from "./CartItem";
import {getCartItemKey} from "../utils";
import type {CheckoutMode} from "../types/checkout";
import type {Snapshot} from "../types/ISnapshot";
import {ICartItem} from "../types/ICart";

type CartListProps = {
  items: Snapshot[];
  selectedKeys: string[];
  checkoutMode: CheckoutMode;
  setCartData: React.Dispatch<React.SetStateAction<ICartItem | null>>;
  refreshCart: () => Promise<void>;
  onToggleItem: (item: Snapshot, index: number, checked: boolean) => void;
};

export function CartList({
  items,
  selectedKeys,
  checkoutMode,
  setCartData,
  refreshCart,
  onToggleItem,
}: CartListProps) {
  return (
    <Card className="divide-y overflow-hidden">
      {items && items.length > 0 ? (
        items.map((item, index) => (
          <CartItem
            setCartData={setCartData}
            refreshCart={refreshCart}
            key={getCartItemKey(item, index)}
            item={item}
            checked={selectedKeys.includes(getCartItemKey(item, index))}
            checkoutMode={checkoutMode}
            onCheckedChange={(checked) => onToggleItem(item, index, checked)}
          />
        ))
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          No items in cart
        </div>
      )}
    </Card>
  );
}
