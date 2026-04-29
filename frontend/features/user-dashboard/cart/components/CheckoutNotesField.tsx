import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import type {
  CheckoutFormState,
  UpdateCheckoutField,
} from "../types/checkout";

type CheckoutNotesFieldProps = {
  notes: CheckoutFormState["notes"];
  updateField: UpdateCheckoutField;
};

export function CheckoutNotesField({
  notes,
  updateField,
}: CheckoutNotesFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notes</Label>
      <Textarea
        id="notes"
        value={notes}
        onChange={(event) => updateField("notes", event.target.value)}
        placeholder="Special instructions"
      />
    </div>
  );
}
