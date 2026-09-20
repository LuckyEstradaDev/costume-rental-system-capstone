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
      <div className="flex items-center justify-between">
        <Label htmlFor="notes">Notes</Label>
        <span className="text-xs text-muted-foreground">Optional</span>
      </div>
      <Textarea
        id="notes"
        value={notes}
        onChange={(event) => updateField("notes", event.target.value)}
        placeholder="Special instructions (e.g., preferred pickup time)"
      />
    </div>
  );
}