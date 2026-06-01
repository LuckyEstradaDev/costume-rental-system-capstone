"use client";

import {Card} from "@/components/ui/card";
import {CartItem} from "./CartItem";
import {getCartItemKey} from "../utils";
import type {CheckoutMode} from "../types/checkout";
import type {Snapshot} from "../types/ISnapshot";

type CartListProps = {
  items: Snapshot[];
  selectedKeys: string[];
  checkoutMode: CheckoutMode;
  onToggleItem: (item: Snapshot, index: number, checked: boolean) => void;
};

export function CartList({
  items,
  selectedKeys,
  checkoutMode,
  onToggleItem,
}: CartListProps) {
  return (
    <Card className="divide-y overflow-hidden">
      {items && items.length > 0 ? (
        items.map((item, index) => (
          <CartItem
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
