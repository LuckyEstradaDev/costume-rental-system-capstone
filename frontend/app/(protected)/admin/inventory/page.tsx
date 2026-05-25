"use client";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {OutfitModal} from "@/features/admin-dashboard/inventory-tab/components/OutfitModal";
import OutfitAnalytics from "@/features/admin-dashboard/inventory-tab/components/OutfitAnalytics";
import OutfitCard from "@/features/admin-dashboard/inventory-tab/components/OutfitCard";
import {useOutfit} from "@/features/admin-dashboard/inventory-tab/hooks/useOutfit";
import {OutfitProvider} from "@/features/admin-dashboard/inventory-tab/providers/OutfitProvider";
import {fetchOutfitsService} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {useEffect, useState} from "react";
import {Plus, Search, Package} from "lucide-react";

export default function Page() {
  const [outfits, setOutfits] = useState<IOutfit[]>([]);

  useEffect(() => {
    const fetchOufits = async () => {
      const {data} = await fetchOutfitsService();
      setOutfits(data);
    };

    fetchOufits();
  }, []);

  return (
    <OutfitProvider>
      <InventoryPageContent outfits={outfits} />
    </OutfitProvider>
  );
}

function InventoryPageContent({outfits}: {outfits: IOutfit[]}) {
  const {setModalOpen, setIsEdit} = useOutfit();

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Package className="size-4.5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Inventory
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your outfits, stock, and pricing.
            </p>
          </div>
        </div>
      </div>

      {/* ── Analytics ── */}
      <OutfitAnalytics />

      <Separator className="opacity-50" />

      {/* ── Search bar + Add button ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search outfits…"
            className="h-10 w-full rounded-xl border-border/60 bg-muted/40 pl-9 text-sm placeholder:text-muted-foreground/60 focus-visible:bg-background focus-visible:ring-1"
          />
        </div>
        <Button
          onClick={() => {
            setModalOpen(true);
            setIsEdit(false);
          }}
          className="gap-2 rounded-xl"
        >
          <Plus className="size-4" />
          Add Outfit
        </Button>
      </div>

      {/* ── Results count ── */}
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{outfits.length}</span>{" "}
        outfits in inventory
      </p>

      {/* ── Outfit list ── */}
      <div className="space-y-3">
        {outfits.map((item) => (
          <OutfitCard key={item._id} data={item} />
        ))}
      </div>

      <OutfitModal />
    </div>
  );
}
