import Link from "next/link";
import {ArrowRight, ShoppingBag} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";

export function CartEmpty() {
  return (
    <Card className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border px-6 py-16 text-center shadow-sm">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10">
        <ShoppingBag className="size-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">
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