import {Receipt} from "lucide-react";
import {Card} from "@/components/ui/card";
import {OrderTrackingCard} from "./OrderTrackingCard";
import {IRent} from "../../rent/types/IRent";
import {IOrder} from "../../buy/types/IOrder";

export function OrdersList({items}: {items: (IOrder | IRent)[]}) {
  if (items.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-6 py-16 text-center">
        <Receipt className="mb-4 size-9 text-muted-foreground" />
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          No records found
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Your orders and rents will appear here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <OrderTrackingCard key={item._id} item={item} />
      ))}
    </div>
  );
}
