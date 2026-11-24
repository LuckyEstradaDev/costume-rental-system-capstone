import {ShoppingBag} from "lucide-react";
import {EmptyState} from "@/components/ui/empty-state";

export function CartEmpty() {
  return <EmptyState icon={ShoppingBag} title="Your cart is empty" />;
}
