"use client";

import {AlertDialogComponent} from "@/components/AlertDialog";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import type {ReactNode} from "react";
import {Skeleton} from "@/components/ui/skeleton";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {EmptyState} from "@/components/ui/empty-state";
import {AdminPageHeader, AdminPageTitle} from "@/features/admin-dashboard/components/AdminPageHeader";
import {AdminSearchInput} from "@/features/admin-dashboard/components/AdminSearchInput";
import {AdminSegmented} from "@/features/admin-dashboard/components/AdminSegmented";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {OutfitModal} from "@/features/admin-dashboard/inventory-tab/components/OutfitModal";
import OutfitAnalytics from "@/features/admin-dashboard/inventory-tab/components/OutfitAnalytics";
import InventoryOutfitRow from "@/features/admin-dashboard/inventory-tab/components/InventoryOutfitRow";
import {InventoryPackageRow} from "@/features/admin-dashboard/packages/components/InventoryPackageRow";
import type {IPackage} from "@/features/admin-dashboard/packages/types/IPackage";
import {fetchPackagesService} from "@/features/admin-dashboard/packages/services/PackageService";
import {useOutfit} from "@/features/admin-dashboard/inventory-tab/hooks/useOutfit";
import {OutfitProvider} from "@/features/admin-dashboard/inventory-tab/providers/OutfitProvider";
import {fetchOutfitsService} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import type {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {getOutfitBranchLabel} from "@/features/admin-dashboard/inventory-tab/constants/constants";
import {useState} from "react";
import {
  AlertCircle,
  Layers3,
  Package,
  Plus,
  Shirt,
  SlidersHorizontal,
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
        isOutfitsRetrying={outfitsQuery.isFetching}
        isPackagesRetrying={packagesQuery.isFetching}
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

function SectionHeading({children}: {children: ReactNode}) {
  return (
    <h2 className="text-xl font-semibold text-primary md:text-2xl">
      {children}
    </h2>
  );
}

function InventoryPageContent({
  outfits,
  packages,
  isOutfitsLoading,
  isOutfitsError,
  isPackagesLoading,
  isPackagesError,
  isOutfitsRetrying,
  isPackagesRetrying,
  onRetryOutfits,
  onRetryPackages,
}: {
  outfits: IOutfit[];
  packages: IPackage[];
  isOutfitsLoading: boolean;
  isOutfitsError: boolean;
  isPackagesLoading: boolean;
  isPackagesError: boolean;
  isOutfitsRetrying: boolean;
  isPackagesRetrying: boolean;
  onRetryOutfits: () => void;
  onRetryPackages: () => void;
}) {
  const {setModalOpen, setIsEdit} = useOutfit();
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<IPackage | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedView = searchParams.get("view");
  const view: InventoryView = requestedView === "outfits" || requestedView === "packages" ? requestedView : "both";
  const setView = (nextView: InventoryView) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextView === "both") params.delete("view");
    else params.set("view", nextView);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, {scroll: false});
  };
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [inventoryTypeModalOpen, setInventoryTypeModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const filteredOutfits = outfits.filter((outfit) => {
    const searchableText = [
      outfit.name,
      outfit.category,
      outfit.description,
      outfit.fabricType,
      getOutfitBranchLabel(outfit.branch),
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
  const listHeading =
    view === "outfits" ? "Outfits" : view === "packages" ? "Packages" : "All items";

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

  return (
    <div className="-m-6 min-h-[calc(100vh-4.5rem)] min-w-0 space-y-6 bg-muted p-6 pb-24">
      {/* ── Page Header ── */}
      <AdminPageHeader
        title={<AdminPageTitle icon={Package}>Inventory</AdminPageTitle>}
        description="Garments in stock, out on rent, and awaiting care."
      />

      {/* ── Analytics ── */}
      <section className="space-y-4">
        <SectionHeading>Overview</SectionHeading>
        <OutfitAnalytics />
      </section>

      <section className="space-y-4">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <SectionHeading>{listHeading}</SectionHeading>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
            <AdminSearchInput
              value={search}
              onValueChange={setSearch}
              aria-label="Search inventory"
              placeholder="Search"
              wrapperClassName="max-w-64"
              className="h-9"
            />
            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label="Filters"
                  className="h-9 shrink-0 gap-2 bg-background hover:border-secondary hover:bg-secondary hover:text-secondary-foreground"
                >
                  <SlidersHorizontal className="size-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {view !== "both" && <span className="size-1.5 rounded-full bg-accent" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 space-y-3 p-3">
                <p className="text-sm font-semibold text-secondary">Item type</p>
                <InventoryViewToggle options={viewOptions} value={view} onChange={setView} />
              </PopoverContent>
            </Popover>
          </div>
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
                    isRetrying={isOutfitsRetrying}
                  />
                ) : (
                  <Table gridlines>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Outfit</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Colors</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead className="text-right">Purchase price</TableHead>
                        <TableHead className="text-right">Rental price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOutfits.map((item) => (
                        <InventoryOutfitRow
                          key={`outfit-${item._id ?? item.name}`}
                          data={item}
                        />
                      ))}
                    </TableBody>
                  </Table>
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
                    isRetrying={isPackagesRetrying}
                  />
                ) : (
                  <Table gridlines>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Package</TableHead>
                        <TableHead>Availability</TableHead>
                        <TableHead>Outfits</TableHead>
                        <TableHead className="text-right">Purchase price</TableHead>
                        <TableHead className="text-right">Rental price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPackages.map((packageItem) => (
                        <InventoryPackageRow
                          key={`package-${packageItem._id ?? packageItem.name}`}
                          data={packageItem}
                          onEdit={openEditPackage}
                        />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </section>
            )}

          {!hasVisibleItems && !hasVisibleLoading && !hasVisibleError && (
            <EmptyState icon={Package} title={
                normalizedSearch.length > 0
                  ? "Nothing matches your search"
                  : "No inventory yet"
              } />
          )}
        </div>
      </section>

      <OutfitModal />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur md:left-72">
        <div className="flex items-center justify-end px-4 py-3 md:px-6">
          <AlertDialogComponent
            action={openNewInventoryItem}
            title="Add to inventory?"
            description="Open the form to add a new inventory item."
            actionLabel="Continue"
          >
            <Button type="button" size="lg" className="w-full sm:w-auto">
              <Plus />
              Add to inventory
            </Button>
          </AlertDialogComponent>
        </div>
      </div>
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
      size="sm"
      variant="pills"
      aria-label="Inventory category"
      value={value}
      onValueChange={onChange}
      options={options}
    />
  );
}

// Sentence case and the primary tone instead of tracked uppercase, with the
// count as quiet text rather than a pill.
function InventoryGroupHeading({label, count}: {label: string; count: number}) {
  return (
    <div className="flex items-baseline gap-2">
      <h3 className="text-lg font-semibold text-primary">{label}</h3>
      <span className="text-sm tabular-nums text-muted-foreground">{count}</span>
    </div>
  );
}

function InventoryListSkeleton() {
  return (
    <Skeleton role="status" aria-label="Loading inventory" className="h-[224px] w-full rounded-lg" />
  );
}

function InventoryErrorState({
  resource,
  onRetry,
  isRetrying = false,
}: {
  resource: string;
  onRetry: () => void;
  isRetrying?: boolean;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg bg-destructive/10 px-6 py-12 text-center"
    >
      <AlertCircle className="size-7 text-destructive" />
      <p className="mt-3 text-base font-semibold text-primary">
        Unable to load {resource.toLowerCase()}
      </p>
      <p className="mt-1 max-w-sm text-base text-muted-foreground leading-relaxed">
        Something went wrong while fetching your {resource.toLowerCase()}. Try
        again to continue.
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          if (isRetrying) return;
          onRetry();
        }}
        loading={isRetrying}
        className="mt-4 rounded-lg bg-background hover:border-secondary hover:bg-secondary hover:text-secondary-foreground"
      >
        {isRetrying ? "Retrying…" : "Try again"}
      </Button>
    </div>
  );
}
