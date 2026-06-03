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

  const fetchOufits = async () => {
    const {data} = await fetchOutfitsService();
    setOutfits(data);
  };

  useEffect(() => {
    const loadOutfits = async () => {
      await fetchOufits();
    };

    void loadOutfits();
  }, []);

  return (
    <OutfitProvider refreshOutfits={fetchOufits}>
      <InventoryPageContent setOutfits={setOutfits} outfits={outfits} />
    </OutfitProvider>
  );
}

function InventoryPageContent({
  setOutfits,
  outfits,
}: {
  setOutfits: React.Dispatch<React.SetStateAction<IOutfit[]>>;
  outfits: IOutfit[];
}) {
  const {setModalOpen, setIsEdit} = useOutfit();
  const [filteredOutfits, setFilteredOutfits] = useState<IOutfit[]>(outfits);
  useEffect(() => {
    setFilteredOutfits(outfits);
  }, [outfits]);

  const handleSearch = (
    event: React.ChangeEvent<HTMLInputElement>,
    outfits: IOutfit[],
  ) => {
    if (!event.target.value) {
      setFilteredOutfits(outfits);
      return;
    }

    const search = event.target.value.trim().toLowerCase();

    const filtered: IOutfit[] = outfits.filter((outfit) => {
      const nameMatch = outfit.name.toLowerCase().includes(search);
      const categoryMatch = outfit.category.toLowerCase().includes(search);
      return nameMatch || categoryMatch;
    });

    setFilteredOutfits(filtered);
  };

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

      {/* ── Search bar + Add button ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            onChange={(e) => handleSearch(e, outfits)}
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

      {/* ── Outfit list ── */}
      <div className="space-y-3">
        {filteredOutfits.map((item) => (
          <OutfitCard key={item._id} data={item} />
        ))}
      </div>

      <OutfitModal />
    </div>
  );
}
