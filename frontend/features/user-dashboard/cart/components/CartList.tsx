import {Card} from "@/components/ui/card";
import {CartItem} from "./CartItem";

export function CartList({items}: {items: any[]}) {
  return (
    <Card className="divide-y overflow-hidden">
      {items.map((item, index) => (
        <CartItem key={index} item={item} />
      ))}
    </Card>
  );
}
