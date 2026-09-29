"use client";

import {Button} from "@/components/ui/button";
import {AdminPageHeader, AdminPageTitle} from "@/features/admin-dashboard/components/AdminPageHeader";
import {AdminSearchInput} from "@/features/admin-dashboard/components/AdminSearchInput";
import {AdminSegmented} from "@/features/admin-dashboard/components/AdminSegmented";
import {OutfitModal} from "@/features/admin-dashboard/inventory-tab/components/OutfitModal";
import OutfitAnalytics from "@/features/admin-dashboard/inventory-tab/components/OutfitAnalytics";
import OutfitCard from "@/features/admin-dashboard/inventory-tab/components/OutfitCard";
import {PackageCard} from "@/features/admin-dashboard/packages/components/PackageCard";
import type {IPackage} from "@/features/admin-dashboard/packages/types/IPackage";
import {fetchPackagesService} from "@/features/admin-dashboard/packages/services/PackageService";
import {useOutfit} from "@/features/admin-dashboard/inventory-tab/hooks/useOutfit";
import {OutfitProvider} from "@/features/admin-dashboard/inventory-tab/providers/OutfitProvider";
import {fetchOutfitsService} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import type {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {useState} from "react";
import {
  AlertCircle,
  Layers3,
  Package,
  Plus,
  Shirt,
  type LucideIcon,
} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import {PackageModal} from "@/features/admin-dashboard/packages/components/PackageModal";
import {
  InventoryTypeModal,
  type InventoryItemType,
} from "@/features/admin-dashboard/inventory-tab/components/InventoryTypeModal";

export default function Page() {
  const outfitsQuery = useQuery({
    queryKey: ["outfits"],
    queryFn: fetchOutfitsService,
  });
  const packagesQuery = useQuery({
    queryKey: ["packages"],
    queryFn: fetchPackagesService,
  });

  return (
    <OutfitProvider>
      <InventoryPageContent
        outfits={outfitsQuery.data ?? []}
        packages={packagesQuery.data ?? []}
        isOutfitsLoading={outfitsQuery.isLoading}
        isOutfitsError={outfitsQuery.isError}
        isPackagesLoading={packagesQuery.isLoading}
        isPackagesError={packagesQuery.isError}
        onRetryOutfits={() => {
          void outfitsQuery.refetch();
        }}
        onRetryPackages={() => {
          void packagesQuery.refetch();
        }}
      />
    </OutfitProvider>
  );
}

type InventoryView = "outfits" | "packages" | "both";

function InventoryPageContent({
  outfits,
  packages,
  isOutfitsLoading,
  isOutfitsError,
  isPackagesLoading,
  isPackagesError,
  onRetryOutfits,
  onRetryPackages,
}: {
  outfits: IOutfit[];
  packages: IPackage[];
  isOutfitsLoading: boolean;
  isOutfitsError: boolean;
  isPackagesLoading: boolean;
  isPackagesError: boolean;
  onRetryOutfits: () => void;
  onRetryPackages: () => void;
}) {
  const {setModalOpen, setIsEdit} = useOutfit();
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<IPackage | null>(null);
  const [view, setView] = useState<InventoryView>("both");
  const [inventoryTypeModalOpen, setInventoryTypeModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const filteredOutfits = outfits.filter((outfit) => {
    const searchableText = [
      outfit.name,
      outfit.category,
      outfit.description,
      outfit.fabricType,
      ...(outfit.variants ?? []).flatMap((variant) => [
        variant.color,
        ...variant.sizes.map((size) => size.size),
      ]),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearch);
  });
  const filteredPackages = packages.filter((packageItem) =>
    [packageItem.name, packageItem.mode].some((field) =>
      field.toLowerCase().includes(normalizedSearch),
    ),
  );
  const showOutfits = view === "outfits" || view === "both";
  const showPackages = view === "packages" || view === "both";
  const hasVisibleItems =
    (showOutfits && filteredOutfits.length > 0) ||
    (showPackages && filteredPackages.length > 0);
  const hasVisibleLoading =
    (showOutfits && isOutfitsLoading) ||
    (showPackages && isPackagesLoading);
  const hasVisibleError =
    (showOutfits && isOutfitsError) ||
    (showPackages && isPackagesError);
  const viewOptions: {
    value: InventoryView;
    label: string;
    count: number;
    icon: LucideIcon;
  }[] = [
    {value: "outfits", label: "Outfits", count: outfits.length, icon: Shirt},
    {
      value: "packages",
      label: "Packages",
      count: packages.length,
      icon: Package,
    },
    {
      value: "both",
      label: "All items",
      count: outfits.length + packages.length,
      icon: Layers3,
    },
  ];

  const openNewInventoryItem = () => {
    setPackageModalOpen(false);
    setEditingPackage(null);
    setIsEdit(false);
    setModalOpen(false);
    setInventoryTypeModalOpen(true);
  };

  const handleNewInventoryType = (type: InventoryItemType) => {
    setEditingPackage(null);
    setIsEdit(false);

    if (type === "outfits") {
      setPackageModalOpen(false);
      setModalOpen(true);
      return;
    }

    setModalOpen(false);
    setPackageModalOpen(true);
  };

  const openEditPackage = (packageItem: IPackage) => {
    setInventoryTypeModalOpen(false);
    setModalOpen(false);
    setEditingPackage(packageItem);
    setPackageModalOpen(true);
  };

  const emptyMessage =
    normalizedSearch.length > 0
      ? "No inventory items match your search."
      : "No inventory items have been added yet.";

  return (
    <div className="min-w-0 space-y-6">
      {/* ── Page Header ── */}
      <AdminPageHeader
        title={<AdminPageTitle icon={Package}>Inventory</AdminPageTitle>}
      />

      {/* ── Analytics ── */}
      <OutfitAnalytics />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <AdminSearchInput
          value={search}
          onValueChange={setSearch}
          aria-label="Search inventory"
          placeholder="Search inventory…"
        />
        <Button
          type="button"
          size="lg"
          onClick={openNewInventoryItem}
          className="w-full lg:w-auto"
        >
          <Plus />
          Add to inventory
        </Button>
      </div>

      <InventoryTypeModal
        open={inventoryTypeModalOpen}
        onOpenChange={setInventoryTypeModalOpen}
        onSelect={handleNewInventoryType}
      />

      {packageModalOpen && (
        <PackageModal
          open
          packageItem={editingPackage}
          onOpenChange={(open) => {
            setPackageModalOpen(open);
            if (!open) setEditingPackage(null);
          }}
        />
      )}

      <div className="min-w-0 overflow-x-auto pb-3">
        <InventoryViewToggle
          options={viewOptions}
          value={view}
          onChange={setView}
        />
      </div>

      <div className="space-y-8">
        {showOutfits &&
          (isOutfitsLoading ||
            isOutfitsError ||
            filteredOutfits.length > 0) && (
            <section className="space-y-3">
              {view === "both" && (
                <InventoryGroupHeading
                  label="Outfits"
                  count={filteredOutfits.length}
                />
              )}
              {isOutfitsLoading ? (
                <InventoryListSkeleton />
              ) : isOutfitsError ? (
                <InventoryErrorState
                  resource="Outfits"
                  onRetry={onRetryOutfits}
                />
              ) : (
                <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-2">
                  {filteredOutfits.map((item) => (
                    <OutfitCard
                      key={`outfit-${item._id ?? item.name}`}
                      data={item}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

        {showPackages &&
          (isPackagesLoading ||
            isPackagesError ||
            filteredPackages.length > 0) && (
            <section className="space-y-3">
              {view === "both" && (
                <InventoryGroupHeading
                  label="Packages"
                  count={filteredPackages.length}
                />
              )}
              {isPackagesLoading ? (
                <InventoryListSkeleton />
              ) : isPackagesError ? (
                <InventoryErrorState
                  resource="Packages"
                  onRetry={onRetryPackages}
                />
              ) : (
                <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-2">
                  {filteredPackages.map((packageItem) => (
                    <PackageCard
                      key={`package-${packageItem._id ?? packageItem.name}`}
                      data={packageItem}
                      onEdit={openEditPackage}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

        {!hasVisibleItems && !hasVisibleLoading && !hasVisibleError && (
          <div className="rounded-lg border border-dashed px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">
              Nothing to show
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{emptyMessage}</p>
            {normalizedSearch.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSearch("")}
                className="mt-3 rounded-md"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>

      <OutfitModal />
    </div>
  );
}

type InventoryViewOption = {
  value: InventoryView;
  label: string;
  count: number;
  icon: LucideIcon;
};

function InventoryViewToggle({
  options,
  value,
  onChange,
}: {
  options: InventoryViewOption[];
  value: InventoryView;
  onChange: (value: InventoryView) => void;
}) {
  return (
    <AdminSegmented
      aria-label="Inventory category"
      value={value}
      onValueChange={onChange}
      options={options}
    />
  );
}

function InventoryGroupHeading({label, count}: {label: string; count: number}) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </h2>
      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

function InventoryListSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading inventory"
      className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-2"
    >
      {Array.from({length: 4}, (_, index) => (
        <div
          key={index}
          className="h-52 animate-pulse rounded-lg border bg-muted/50"
        />
      ))}
    </div>
  );
}

function InventoryErrorState({
  resource,
  onRetry,
}: {
  resource: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
    >
      <AlertCircle className="size-7 text-destructive" />
      <p className="mt-3 text-sm font-medium text-foreground">
        Unable to load {resource.toLowerCase()}
      </p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Something went wrong while fetching your {resource.toLowerCase()}. Try
        again to continue.
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="mt-4 rounded-lg"
      >
        Try again
      </Button>
    </div>
  );
}
