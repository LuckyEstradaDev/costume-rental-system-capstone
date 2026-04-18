import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";

export function CartSummary({items}: {items: any[]}) {
  // TODO: Calculate actual values from items
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const tax = subtotal * 0.1; // Example 10% tax
  const total = subtotal + tax;

  return (
    <Card className="sticky top-6 space-y-4 p-6">
      <h2 className="text-lg font-semibold">Order Summary</h2>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold">${total.toFixed(2)}</span>
        </div>
      </div>

      <Button className="w-full" size="lg" disabled={items.length === 0}>
        Proceed to Checkout
      </Button>

      <Button variant="outline" className="w-full" size="sm">
        Continue Shopping
      </Button>

      <div className="space-y-2 rounded-lg bg-muted/50 p-3 text-xs">
        <p className="font-medium text-foreground">Rental Information:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Select rental dates at checkout</li>
          <li>• Standard rental period: 3-7 days</li>
          <li>• Damage waiver included</li>
        </ul>
      </div>
    </Card>
  );
}
