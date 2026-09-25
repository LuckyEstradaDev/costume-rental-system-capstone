"use client";

import {Package, Shirt} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type InventoryItemType = "outfits" | "packages";

type InventoryTypeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: InventoryItemType) => void;
};

const itemOptions = [
  {
    type: "outfits" as const,
    label: "Outfit",
    icon: Shirt,
  },
  {
    type: "packages" as const,
    label: "Package",
    icon: Package,
  },
];

export function InventoryTypeModal({
  open,
  onOpenChange,
  onSelect,
}: InventoryTypeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>What would you like to add?</DialogTitle>
          <DialogDescription>
            Choose an item type to start adding it to your inventory.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 pt-2">
          {itemOptions.map(({type, label, icon: Icon}) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onOpenChange(false);
                onSelect(type);
              }}
              className="group relative flex aspect-square cursor-pointer items-center justify-center rounded-2xl border border-border/70 bg-background p-5 text-center transition-colors hover:border-primary/60 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <span className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <Icon className="size-8" />
              </span>
              <span className="absolute inset-x-3 bottom-4 text-sm font-semibold text-foreground">
                {label}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
