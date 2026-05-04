import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import type {
  CheckoutFormState,
  UpdateCheckoutField,
} from "@/features/user-dashboard/cart/types/checkout";

type RentCheckoutFieldsProps = {
  formState: CheckoutFormState;
  updateField: UpdateCheckoutField;
};

export function RentCheckoutFields({
  formState,
  updateField,
}: RentCheckoutFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="rentalDays">Rental days</Label>
        <Input
          id="rentalDays"
          min="1"
          step="1"
          type="number"
          value={formState.rentalDays}
          onChange={(event) => updateField("rentalDays", event.target.value)}
        />
      </div>
      <p className="self-end text-sm text-muted-foreground">
        The rent start date will be set when the outfit is picked up.
      </p>
    </div>
  );
}
