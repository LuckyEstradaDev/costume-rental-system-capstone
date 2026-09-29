"use client";

import {Package, Shirt} from "lucide-react";

import {Dialog} from "@/components/ui/dialog";
import {
  AdminDialogBody,
  AdminDialogContent,
  AdminDialogHeader,
} from "@/features/admin-dashboard/components/AdminDialog";

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
      <AdminDialogContent width="md">
        <AdminDialogHeader
          title="What would you like to add?"
          description="Choose an item type to start adding it to your inventory."
        />
        <AdminDialogBody className="grid min-w-0 grid-cols-2 gap-3">
          {itemOptions.map(({type, label, icon: Icon}) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onOpenChange(false);
                onSelect(type);
              }}
              className="group relative flex min-w-0 aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-background p-3 text-center transition-colors hover:border-primary/60 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:p-5"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15 sm:size-16">
                <Icon className="size-6 sm:size-8" />
              </span>
              <span className="absolute inset-x-2 bottom-3 max-w-full truncate text-xs font-semibold text-foreground sm:inset-x-3 sm:bottom-4 sm:text-sm">
                {label}
              </span>
            </button>
          ))}
        </AdminDialogBody>
      </AdminDialogContent>
    </Dialog>
  );
}
