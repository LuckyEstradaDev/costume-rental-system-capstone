"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {useParams} from "next/navigation";
import {useEffect, useMemo, useRef, useState} from "react";
import {useQueries, useQuery} from "@tanstack/react-query";
import {
  CalendarClock,
  ChevronLeft,
  Package,
  Palette,
  Plus,
  Ruler,
  Shirt,
  ShoppingCart,
  X,
} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {useNotification} from "@/components/ui/alert";
import {fetchPackageById} from "@/features/admin-dashboard/packages/services/PackageService";
import {fetchOutfitById} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import type {IPackage} from "@/features/admin-dashboard/packages/types/IPackage";
import type {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";

const FALLBACK_IMAGE = "/assets/images/landing-page/suit.jpg";
const getIdFromSlug = (slug: string) => slug.split("-").at(-1) ?? "";
const getOutfitKey = (outfit: IOutfit, index: number) =>
  outfit._id ?? `${outfit.name}-${index}`;

function formatPrice(value?: number) {
  return `PHP ${(value ?? 0).toLocaleString()}`;
}

function totalStock(outfit: IOutfit) {
  return outfit.variants.reduce(
    (total, variant) =>
      total + variant.sizes.reduce((sum, size) => sum + size.stock, 0),
    0,
  );
}

function buildOutfitSlug(name: string, outfitId?: string) {
  if (!outfitId) return "";
  return `${name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}-${outfitId}`;
}

type ItemInstance = {
  id: string;
  outfitKey: string;
  outfitId?: string;
  variantId?: string;
  size?: string;
};

type SelectionLine = {
  instance: ItemInstance;
  outfit: IOutfit;
  variantName?: string;
  isComplete: boolean;
  purchasePrice: number;
  rentalPrice: number;
};

function getVariant(outfit: IOutfit, variantId?: string) {
  return outfit.variants.find(
    (variant, index) => variant._id === variantId || `${index}` === variantId,
  );
}

function isCompleteSelection(outfit: IOutfit, instance: ItemInstance) {
  const variant = getVariant(outfit, instance.variantId);
  const size = variant?.sizes.find((option) => option.size === instance.size);
  return Boolean(variant && size && size.stock > 0);
}

function PackageGallery({images, name}: {images: string[]; name: string}) {
  const galleryImages = images.length ? images : [FALLBACK_IMAGE];
  const [selectedImage, setSelectedImage] = useState(galleryImages[0]);

  return (
    <div className="space-y-2">
      <div className="relative aspect-16/10 overflow-hidden rounded-xl border bg-muted">
        <img src={selectedImage} alt={name} className="size-full object-cover" />
      </div>
      {galleryImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {galleryImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedImage(image)}
              aria-label={`View package image ${index + 1}`}
              className={`cursor-pointer size-12 shrink-0 overflow-hidden rounded-md border-2 ${
                selectedImage === image ? "border-primary" : "border-transparent"
              }`}
            >
              <img src={image} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemInstanceSelector({
  outfit,
  instance,
  canRemove,
  onVariantChange,
  onSizeChange,
  onRemove,
}: {
  outfit: IOutfit;
  instance: ItemInstance;
  canRemove: boolean;
  onVariantChange: (variantId: string) => void;
  onSizeChange: (size: string) => void;
  onRemove: () => void;
}) {
  const selectedVariant = getVariant(outfit, instance.variantId);

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-3 border-b pb-2">
        <div>
          <p className="text-sm font-semibold">Item selection</p>
          <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Palette className="size-3" /> {selectedVariant?.color || "Color needed"}</span>
            <span className="inline-flex items-center gap-1"><Ruler className="size-3" /> {instance.size || "Size needed"}</span>
          </div>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="cursor-pointer inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={`Remove ${outfit.name} item`}
          >
            <X className="size-3.5" /> Remove
          </button>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Palette className="size-3.5" /> Color</p>
        {outfit.variants.length ? (
          <div className="flex flex-wrap gap-1.5">
            {outfit.variants.map((variant, index) => {
              const variantId = variant._id ?? `${index}`;
              const isAvailable = variant.sizes.some((size) => size.stock > 0);
              const isSelected = instance.variantId === variantId;
              return (
                <button
                  key={variantId}
                  type="button"
                  onClick={() => isAvailable && onVariantChange(variantId)}
                  disabled={!isAvailable}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    isSelected
                      ? "cursor-pointer border-primary bg-primary text-primary-foreground"
                      : isAvailable
                        ? "cursor-pointer border-border bg-background hover:border-foreground/40 hover:bg-muted/50"
                        : "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-60"
                  }`}
                >
                  {variant.color || "Unnamed color"}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No color variants available.</p>
        )}
        </div>
      <div className="space-y-1.5">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Ruler className="size-3.5" /> Size</p>
        {selectedVariant ? (
          <div className="flex flex-wrap gap-1.5">
            {selectedVariant.sizes.map((sizeOption) => {
              const isAvailable = sizeOption.stock > 0;
              const isSelected = instance.size === sizeOption.size;
              return (
                <button
                  key={`${selectedVariant._id ?? selectedVariant.color}-${sizeOption.size}`}
                  type="button"
                  onClick={() => isAvailable && onSizeChange(sizeOption.size)}
                  disabled={!isAvailable}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    isSelected
                      ? "cursor-pointer border-primary bg-primary text-primary-foreground"
                      : isAvailable
                        ? "cursor-pointer border-border bg-background hover:border-foreground/40 hover:bg-muted/50"
                        : "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-60"
                  }`}
                >
                  {sizeOption.size}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Select a color first.</p>
        )}
      </div>
      </div>
    </div>
  );
}

function OutfitDetails({
  outfit,
  instances,
  packageMode,
  onAddItem,
  onVariantChange,
  onSizeChange,
  onRemove,
}: {
  outfit: IOutfit;
  instances: ItemInstance[];
  packageMode: IPackage["mode"];
  onAddItem: () => void;
  onVariantChange: (instanceId: string, variantId: string) => void;
  onSizeChange: (instanceId: string, size: string) => void;
  onRemove: (instanceId: string) => void;
}) {
  const detailSlug = buildOutfitSlug(outfit.name, outfit._id);
  const purchasePrice = Number(outfit.purchasePackagePrice) || 0;
  const rentalPrice = Number(outfit.rentalPackagePrice) || 0;

  return (
    <article className="space-y-3 rounded-xl border bg-background p-3 sm:p-4">
      <div className="flex gap-3">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-28">
          <img
            src={typeof outfit.imageURL === "string" ? outfit.imageURL : FALLBACK_IMAGE}
            alt={outfit.name}
            className="size-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          {detailSlug ? (
            <Link href={`/dashboard/browse/${detailSlug}`} className="cursor-pointer text-lg font-semibold tracking-tight hover:underline sm:text-xl">
              {outfit.name}
            </Link>
          ) : (
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{outfit.name}</h2>
          )}
          <div className="flex flex-wrap gap-2">
            <Badge>{outfit.category}</Badge>
            {outfit.fabricType && <Badge variant="secondary">{outfit.fabricType}</Badge>}
            <Badge variant={totalStock(outfit) > 0 ? "outline" : "destructive"}>
              {totalStock(outfit) > 0 ? `${totalStock(outfit)} available` : "Out of stock"}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {(packageMode === "purchase" || packageMode === "both") && (
              <span className="inline-flex items-center gap-1 font-medium text-foreground"><Package className="size-3.5" /> Buy {formatPrice(purchasePrice)}</span>
            )}
            {(packageMode === "rental" || packageMode === "both") && (
              <span className="inline-flex items-center gap-1 font-medium text-foreground"><CalendarClock className="size-3.5" /> Rent {formatPrice(rentalPrice)}</span>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-2 border-t pt-3">
        {instances.map((instance, index) => (
          <ItemInstanceSelector
            key={instance.id}
            outfit={outfit}
            instance={instance}
            canRemove={index > 0}
            onVariantChange={(variantId) => onVariantChange(instance.id, variantId)}
            onSizeChange={(size) => onSizeChange(instance.id, size)}
            onRemove={() => onRemove(instance.id)}
          />
        ))}
        <Button type="button" variant="outline" size="sm" className="cursor-pointer gap-2" onClick={onAddItem}>
          <Plus className="size-4" /> Add item
        </Button>
      </div>
    </article>
  );
}

function PackagePriceFooter({
  mode,
  lines,
  totals,
  expanded,
  onToggle,
  onAddToCart,
}: {
  mode: IPackage["mode"];
  lines: SelectionLine[];
  totals: {purchaseTotal: number; rentalTotal: number};
  expanded: boolean;
  onToggle: () => void;
  onAddToCart: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur md:left-64">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
        {expanded && (
          <div className="mb-2 max-h-[45vh] overflow-y-auto rounded-lg border bg-muted/20 p-2.5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Price breakdown</h2>
                <p className="text-xs text-muted-foreground">Package totals are calculated from the selected package items.</p>
              </div>
              <span className="text-xs text-muted-foreground">{lines.length} item{lines.length === 1 ? "" : "s"}</span>
            </div>
            <div className="divide-y rounded-lg border bg-background text-sm">
              {lines.map(({instance, outfit, variantName, isComplete, purchasePrice, rentalPrice}) => (
                <div key={instance.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
                  <span className="min-w-0 truncate">
                    {outfit.name} - {variantName || "Color not selected"} / {instance.size || "Size not selected"}
                    {!isComplete && " (incomplete)"}
                  </span>
                  {isComplete ? (
                    <span className="shrink-0 text-right text-muted-foreground">
                      {(mode === "purchase" || mode === "both") && formatPrice(purchasePrice)}
                      {mode === "both" && " · "}
                      {(mode === "rental" || mode === "both") && formatPrice(rentalPrice)}
                    </span>
                  ) : (
                    <span className="shrink-0 text-muted-foreground">Complete selection</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={onToggle} className="cursor-pointer text-left" aria-expanded={expanded}>
            <span className="text-xs font-medium text-muted-foreground">{expanded ? "Hide price breakdown" : "View price breakdown"}</span>
            <span className="mt-0.5 block text-base font-semibold">
              {(mode === "purchase" || mode === "both") && `Buy ${formatPrice(totals.purchaseTotal)}`}
              {mode === "both" && " · "}
              {(mode === "rental" || mode === "both") && `Rent ${formatPrice(totals.rentalTotal)}`}
            </span>
          </button>
          <Button type="button" className="w-full cursor-pointer gap-2 sm:w-auto" onClick={onAddToCart}>
            <ShoppingCart className="size-4" /> Add package to cart
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BrowsePackagePage() {
  const params = useParams<{packageSlug?: string | string[]}>();
  const rawSlug = Array.isArray(params.packageSlug) ? params.packageSlug[0] : params.packageSlug;
  const packageId = rawSlug ? getIdFromSlug(rawSlug) : "";
  const {data: packageItem, isLoading, isError} = useQuery<IPackage>({
    queryKey: ["package", packageId],
    queryFn: () => fetchPackageById(packageId),
    enabled: Boolean(packageId),
  });
  const outfitQueries = useQueries({
    queries: (packageItem?.items ?? []).map((outfitId) => ({
      queryKey: ["outfit", outfitId],
      queryFn: async () => (await fetchOutfitById(outfitId)).data as IOutfit,
      enabled: Boolean(outfitId),
    })),
  });
  const outfits = outfitQueries.flatMap((query) => query.data ? [query.data] : []);
  const isLoadingOutfits = outfitQueries.some((query) => query.isLoading);
  const {notify} = useNotification();
  const [instances, setInstances] = useState<ItemInstance[]>([]);
  const [priceBreakdownExpanded, setPriceBreakdownExpanded] = useState(false);
  const itemId = useRef(0);
  const initializedPackageId = useRef<string | undefined>(undefined);

  const createInstance = (outfit: IOutfit, index: number): ItemInstance => ({
    id: `${getOutfitKey(outfit, index)}-item-${itemId.current++}`,
    outfitKey: getOutfitKey(outfit, index),
    outfitId: outfit._id,
  });

  useEffect(() => {
    // Query data defines the initial configurable instances for this package.
    if (
      packageItem &&
      !isLoadingOutfits &&
      initializedPackageId.current !== packageItem._id
    ) {
      initializedPackageId.current = packageItem._id;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInstances(outfits.map(createInstance));
    }
  }, [isLoadingOutfits, outfits, packageItem]);

  const selectionLines = useMemo(() => {
    if (!packageItem) return [];
    const outfitsByKey = new Map(outfits.map((outfit, index) => [getOutfitKey(outfit, index), outfit]));
    return instances.flatMap((instance): SelectionLine[] => {
      const outfit = outfitsByKey.get(instance.outfitKey);
      if (!outfit) return [];
      const variant = getVariant(outfit, instance.variantId);
      return [{
        instance,
        outfit,
        variantName: variant?.color,
        isComplete: isCompleteSelection(outfit, instance),
        purchasePrice: Number(outfit.purchasePackagePrice) || 0,
        rentalPrice: Number(outfit.rentalPackagePrice) || 0,
      }];
    });
  }, [instances, outfits, packageItem]);

  const selectedPackageTotals = useMemo(
    () => selectionLines.reduce(
      (totals, line) => ({
        purchaseTotal: totals.purchaseTotal + (line.isComplete ? line.purchasePrice : 0),
        rentalTotal: totals.rentalTotal + (line.isComplete ? line.rentalPrice : 0),
      }),
      {purchaseTotal: 0, rentalTotal: 0},
    ),
    [selectionLines],
  );

  const updateInstance = (id: string, update: Partial<ItemInstance>) => {
    setInstances((current) => current.map((instance) => instance.id === id ? {...instance, ...update} : instance));
  };

  const handleVariantChange = (outfit: IOutfit, id: string, variantId: string) => {
    const variant = getVariant(outfit, variantId);
    if (!variant?.sizes.some((size) => size.stock > 0)) return;
    updateInstance(id, {variantId, size: undefined});
  };

  const handleSizeChange = (outfit: IOutfit, id: string, size: string) => {
    const instance = instances.find((item) => item.id === id);
    const selectedSize = getVariant(outfit, instance?.variantId)?.sizes.find((item) => item.size === size);
    if (!selectedSize || selectedSize.stock <= 0) return;
    updateInstance(id, {size});
  };

  const handleAddToCart = () => {
    const incompleteLine = selectionLines.find((line) => !line.isComplete);
    if (incompleteLine) {
      notify({
        title: "Complete your selections",
        description: `Choose an available color and size for ${incompleteLine.outfit.name}.`,
        variant: "warning",
      });
      return;
    }
    notify({
      title: "Package selections ready",
      description: "Your package items are complete. Cart saving will be connected next.",
      variant: "success",
    });
  };

  if (isLoading || !packageId || isLoadingOutfits) return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground">Loading package...</div>;
  if (isError || !packageItem) return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground">Unable to find this package.</div>;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 pb-36 md:px-8 md:py-7 md:pb-36">
        <Link href="/dashboard/browse" className="inline-flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /> Back to browse</Link>
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] xl:gap-8">
          <PackageGallery images={packageItem.imageURL ?? []} name={packageItem.name} />
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2"><Badge><Package className="mr-1 size-3" />Package</Badge><Badge variant="secondary">{packageItem.items.length} outfits</Badge></div>
              <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">{packageItem.name}</h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Configure the color and size for each item in this package.</p>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/20 p-2.5"><p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Package className="size-3.5" /> Included outfits</p><p className="mt-0.5 font-semibold">{packageItem.items.length}</p></div>
              <div className="rounded-lg border bg-muted/20 p-2.5"><p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Shirt className="size-3.5" /> Available pieces</p><p className="mt-0.5 font-semibold">{outfits.reduce((sum, outfit) => sum + totalStock(outfit), 0)}</p></div>
            </div>
          </div>
        </section>
        <Separator />
        <section className="space-y-3">
          <div><h2 className="text-xl font-semibold tracking-tight">Included outfits</h2><p className="mt-0.5 text-sm text-muted-foreground">Select an available color and size for every package item.</p></div>
          {outfits.map((outfit, index) => {
            const outfitKey = getOutfitKey(outfit, index);
            return <OutfitDetails key={outfitKey} outfit={outfit} instances={instances.filter((item) => item.outfitKey === outfitKey)} packageMode={packageItem.mode} onAddItem={() => setInstances((current) => [...current, createInstance(outfit, index)])} onVariantChange={(id, variantId) => handleVariantChange(outfit, id, variantId)} onSizeChange={(id, size) => handleSizeChange(outfit, id, size)} onRemove={(id) => setInstances((current) => current.filter((item) => item.id !== id))} />;
          })}
        </section>
      </div>
      <PackagePriceFooter mode={packageItem.mode} lines={selectionLines} totals={selectedPackageTotals} expanded={priceBreakdownExpanded} onToggle={() => setPriceBreakdownExpanded((current) => !current)} onAddToCart={handleAddToCart} />
    </main>
  );
}
