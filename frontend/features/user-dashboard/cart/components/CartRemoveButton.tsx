import type {ComponentProps} from "react";
import {Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";

export function CartRemoveButton(props: ComponentProps<"button">) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="ml-1 size-8 shrink-0 cursor-pointer rounded-md p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      {...props}
    >
      <Trash2 className="size-4" aria-hidden="true" />
    </Button>
  );
}
