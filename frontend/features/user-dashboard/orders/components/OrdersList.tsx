import {Card} from "@/components/ui/card";
import {OrderTrackingCard} from "./OrderTrackingCard";
import {IRent} from "../../rent/types/IRent";
import {IOrder} from "../../buy/types/IOrder";

export function OrdersList({items}: {items: (IOrder | IRent)[]}) {
  if (items.length === 0) {
    return (
      <Card className="p-4 text-center">
        <h2 className="text-lg font-semibold">No records found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
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
