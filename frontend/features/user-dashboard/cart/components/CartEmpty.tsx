import Link from "next/link";
import {ArrowRight, ShoppingBag} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";

export function CartEmpty() {
  return (
    <Card className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-6 py-16 text-center">
      <ShoppingBag className="mb-4 size-9 text-muted-foreground" />
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Your cart is empty
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Start browsing our collection of costumes to add items to your cart.
      </p>
      <Link href="/dashboard/browse" className="mt-6">
        <Button>
          Browse Costumes
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </Link>
    </Card>
  );
}