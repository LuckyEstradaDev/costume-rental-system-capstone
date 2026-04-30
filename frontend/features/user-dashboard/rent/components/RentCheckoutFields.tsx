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
        <Label htmlFor="rentStart">Rent start</Label>
        <Input
          id="rentStart"
          type="datetime-local"
          value={formState.rentStart}
          onChange={(event) => updateField("rentStart", event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rentEnd">Rent end</Label>
        <Input
          id="rentEnd"
          type="datetime-local"
          value={formState.rentEnd}
          onChange={(event) => updateField("rentEnd", event.target.value)}
        />
      </div>
    </div>
  );
}
