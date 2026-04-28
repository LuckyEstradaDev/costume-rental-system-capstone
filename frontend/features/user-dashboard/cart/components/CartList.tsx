"use client";

import {Card} from "@/components/ui/card";
import {CartItem} from "./CartItem";
import {CartItemData, getCartItemKey} from "../utils";

type CartListProps = {
  items: CartItemData[];
  selectedKeys: string[];
  onToggleItem: (item: CartItemData, index: number, checked: boolean) => void;
};

export function CartList({
  items,
  selectedKeys,
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
