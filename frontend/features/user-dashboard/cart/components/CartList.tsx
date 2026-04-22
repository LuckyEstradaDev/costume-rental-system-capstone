import {Card} from "@/components/ui/card";
import {CartItem} from "./CartItem";
import {ICartItem} from "../types/ICart";

type CartItemData = ICartItem["items"][number];

export function CartList({items}: {items: CartItemData[]}) {
  return (
    <Card className="divide-y overflow-hidden">
      {items && items.length > 0 ? (
        items.map((item, index) => (
          <CartItem key={`${item.outfitId}-${index}`} item={item} />
        ))
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          No items in cart
        </div>
      )}
    </Card>
  );
}
