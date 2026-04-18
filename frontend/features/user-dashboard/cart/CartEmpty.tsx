import Link from "next/link";
import {ShoppingBag} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";

export function CartEmpty() {
  return (
    <Card className="flex flex-col items-center justify-center border-dashed border-2 border-muted-foreground/25 py-12 px-6">
      <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground/50" />
      <h2 className="text-lg font-semibold">Your cart is empty</h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Start browsing our collection of costumes to add items to your cart.
      </p>
      <Link href="/dashboard/browse" className="mt-6">
        <Button>Browse Costumes</Button>
      </Link>
    </Card>
  );
}
