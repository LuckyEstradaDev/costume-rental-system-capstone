"use client";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {OutfitModal} from "@/features/admin-dashboard/inventory-tab/components/OutfitModal";
import OutfitAnalytics from "@/features/admin-dashboard/inventory-tab/components/OutfitAnalytics";
import OutfitCard from "@/features/admin-dashboard/inventory-tab/components/OutfitCard";
import {PackageCard} from "@/features/admin-dashboard/packages/components/PackageCard";
import type {IPackage} from "@/features/admin-dashboard/packages/types/IPackage";
import {fetchPackagesService} from "@/features/admin-dashboard/packages/services/PackageService";
import {useOutfit} from "@/features/admin-dashboard/inventory-tab/hooks/useOutfit";
import {OutfitProvider} from "@/features/admin-dashboard/inventory-tab/providers/OutfitProvider";
import {fetchOutfitsService} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {useState} from "react";
import {Plus, Search, Package} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import {PackageModal} from "@/features/admin-dashboard/packages/components/PackageModal";

export default function Page() {
  const {data: outfits = []} = useQuery({
    queryKey: ["outfits"],
    queryFn: fetchOutfitsService,
  });
  const {data: packages = []} = useQuery({
    queryKey: ["packages"],
    queryFn: fetchPackagesService,
  });
  return (
    <OutfitProvider>
      <InventoryPageContent outfits={outfits} packages={packages} />
    </OutfitProvider>
  );
}

type InventoryView = "outfits" | "packages" | "both";

function InventoryPageContent({
  outfits,
  packages,
}: {
  outfits: IOutfit[];
  packages: IPackage[];
}) {
  const {setModalOpen, setIsEdit} = useOutfit();
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<IPackage | null>(null);
  const [view, setView] = useState<InventoryView>("both");
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const filteredOutfits = outfits.filter((outfit) =>
    [outfit.name, outfit.category].some((field) =>
      field.toLowerCase().includes(normalizedSearch),
    ),
  );
  const filteredPackages = packages.filter((packageItem) =>
    packageItem.name.toLowerCase().includes(normalizedSearch),
  );
  const showOutfits = view === "outfits" || view === "both";
  const showPackages = view === "packages" || view === "both";
  const hasVisibleItems =
    (showOutfits && filteredOutfits.length > 0) ||
    (showPackages && filteredPackages.length > 0);

  const openNewPackage = () => {
    setEditingPackage(null);
    setPackageModalOpen(true);
  };

  const openEditPackage = (packageItem: IPackage) => {
    setEditingPackage(packageItem);
    setPackageModalOpen(true);
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
              Manage your outfits, stock, and packages.
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
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search inventory…"
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
        <Button
          onClick={() => {
            openNewPackage();
          }}
          className="gap-2 rounded-xl"
        >
          <Plus className="size-4" />
          Add Package
        </Button>

        <PackageModal
          open={packageModalOpen}
          packageItem={editingPackage}
          onOpenChange={(open) => {
            setPackageModalOpen(open);
            if (!open) setEditingPackage(null);
          }}
        />
      </div>

      <div className="flex w-full flex-wrap gap-1 rounded-xl bg-muted/50 p-1 sm:w-fit">
        {(["outfits", "packages", "both"] as InventoryView[]).map((option) => (
          <Button
            key={option}
            type="button"
            size="sm"
            variant={view === option ? "default" : "ghost"}
            onClick={() => setView(option)}
            className="flex-1 rounded-lg capitalize sm:flex-none"
          >
            {option}
          </Button>
        ))}
      </div>

      {/* ── Outfit list ── */}
      <div className="space-y-3">
        {showOutfits &&
          filteredOutfits.map((item) => (
            <OutfitCard key={`outfit-${item._id}`} data={item} />
          ))}
        {showPackages &&
          filteredPackages.map((packageItem) => (
            <PackageCard
              key={`package-${packageItem._id}`}
              data={packageItem}
              onEdit={openEditPackage}
            />
          ))}
        {!hasVisibleItems && (
          <div className="rounded-xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
            No inventory items match your search.
          </div>
        )}
      </div>

      <OutfitModal />
    </div>
  );
}
