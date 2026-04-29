import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import type {
  CheckoutFormState,
  UpdateCheckoutField,
} from "../types/checkout";

type OnlinePaymentFieldsProps = {
  formState: CheckoutFormState;
  updateField: UpdateCheckoutField;
};

export function OnlinePaymentFields({
  formState,
  updateField,
}: OnlinePaymentFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="onlinePaymentMethod">Online payment method</Label>
        <Input
          id="onlinePaymentMethod"
          type="text"
          value={formState.onlinePaymentMethod}
          onChange={(event) =>
            updateField("onlinePaymentMethod", event.target.value)
          }
          placeholder="GCash, Maya, bank transfer"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="transactionId">Transaction ID</Label>
        <Input
          id="transactionId"
          type="text"
          value={formState.transactionId}
          onChange={(event) => updateField("transactionId", event.target.value)}
          placeholder="Reference number"
        />
      </div>
    </div>
  );
}
