"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {useParams} from "next/navigation";
import {useMemo, useState} from "react";
import {useQueries, useQuery} from "@tanstack/react-query";
import {ChevronLeft, Package, Shirt, ShoppingCart} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {useNotification} from "@/components/ui/alert";
import {fetchPackageById} from "@/features/admin-dashboard/packages/services/PackageService";
import {fetchOutfitById} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import type {IPackage} from "@/features/admin-dashboard/packages/types/IPackage";
import type {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {PackageProvider} from "@/features/user-dashboard/package/providers/PackageProvider";
import {usePackage} from "@/features/user-dashboard/package/hooks/usePackage";
import {StepIndicator} from "@/features/user-dashboard/package/components/StepIndicator";
import {OutfitPickerStep} from "@/features/user-dashboard/package/components/OutfitPickerStep";
import {ColorPickerStep} from "@/features/user-dashboard/package/components/ColorPickerStep";
import {SizePickerStep} from "@/features/user-dashboard/package/components/SizePickerStep";
import {AmountPickerStep} from "@/features/user-dashboard/package/components/AmountPickerStep";
import {SelectionSummary} from "@/features/user-dashboard/package/components/SelectionSummary";

const FALLBACK_IMAGE = "/assets/images/landing-page/suit.jpg";
const getIdFromSlug = (slug: string) => slug.split("-").at(-1) ?? "";

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

function PackageGallery({images, name}: {images: string[]; name: string}) {
  const galleryImages = images.length ? images : [FALLBACK_IMAGE];
  const [selectedImage, setSelectedImage] = useState(galleryImages[0]);

  return (
    <div className="space-y-2">
      <div className="relative aspect-16/10 overflow-hidden rounded-xl border bg-muted">
        <img
          src={selectedImage}
          alt={name}
          className="size-full object-cover"
        />
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
                selectedImage === image
                  ? "border-primary"
                  : "border-transparent"
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

type SelectionLine = {
  outfitName: string;
  variantName: string;
  sizeName: string;
  quantity: number;
  purchasePrice: number;
  rentalPrice: number;
};

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
                <p className="text-xs text-muted-foreground">
                  Package totals are calculated from your selected items.
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {lines.length} item{lines.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="divide-y rounded-lg border bg-background text-sm">
              {lines.map(
                ({
                  outfitName,
                  variantName,
                  sizeName,
                  quantity,
                  purchasePrice,
                  rentalPrice,
                }) => (
                  <div
                    key={`${outfitName}-${variantName}-${sizeName}-${quantity}`}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5"
                  >
                    <span className="min-w-0 truncate">
                      {outfitName} - {variantName}, size {sizeName} ({quantity})
                    </span>
                    <span className="shrink-0 text-right text-muted-foreground">
                      {(mode === "purchase" || mode === "both") &&
                        formatPrice(purchasePrice * quantity)}
                      {mode === "both" && " · "}
                      {(mode === "rental" || mode === "both") &&
                        formatPrice(rentalPrice * quantity)}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onToggle}
            className="cursor-pointer text-left"
            aria-expanded={expanded}
          >
            <span className="text-xs font-medium text-muted-foreground">
              {expanded ? "Hide price breakdown" : "View price breakdown"}
            </span>
            <span className="mt-0.5 block text-base font-semibold">
              {(mode === "purchase" || mode === "both") &&
                `Buy ${formatPrice(totals.purchaseTotal)}`}
              {mode === "both" && " · "}
              {(mode === "rental" || mode === "both") &&
                `Rent ${formatPrice(totals.rentalTotal)}`}
            </span>
          </button>
          <Button
            type="button"
            className="w-full cursor-pointer gap-2 sm:w-auto"
            onClick={onAddToCart}
          >
            <ShoppingCart className="size-4" /> Add package to cart
          </Button>
        </div>
      </div>
    </div>
  );
}

function BrowsePackageContent({
  packageItem,
  outfits,
}: {
  packageItem: IPackage;
  outfits: IOutfit[];
}) {
  const {notify} = useNotification();
  const {currentStep, selections, isOutfitComplete} = usePackage();
  const [priceBreakdownExpanded, setPriceBreakdownExpanded] = useState(false);

  const selectionLines = useMemo<SelectionLine[]>(
    () =>
      selections.map((sel) => ({
        outfitName: sel.outfitName,
        variantName: sel.color,
        sizeName: sel.size,
        quantity: sel.quantity,
        purchasePrice: sel.purchasePrice,
        rentalPrice: sel.rentalPrice,
      })),
    [selections],
  );

  const packageTotals = useMemo(
    () =>
      selectionLines.reduce(
        (totals, line) => ({
          purchaseTotal:
            totals.purchaseTotal + line.purchasePrice * line.quantity,
          rentalTotal: totals.rentalTotal + line.rentalPrice * line.quantity,
        }),
        {purchaseTotal: 0, rentalTotal: 0},
      ),
    [selectionLines],
  );

  const allOutfitsComplete =
    outfits.length > 0 && outfits.every((o) => isOutfitComplete(o._id!));

  const handleAddToCart = () => {
    if (!allOutfitsComplete) {
      const incomplete = outfits.find((o) => !isOutfitComplete(o._id!));
      notify({
        title: "Meet the minimum quantity",
        description: incomplete
          ? `Add enough ${incomplete.name} variants to meet the package minimum.`
          : "Complete all outfits to meet the package minimums.",
        variant: "warning",
      });
      return;
    }
    notify({
      title: "Package selections ready",
      description: `${selections.length} item${selections.length === 1 ? "" : "s"} configured. Cart saving will be connected next.`,
      variant: "success",
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 pb-36 md:px-8 md:py-7 md:pb-36">
        <Link
          href="/dashboard/browse"
          className="inline-flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> Back to browse
        </Link>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] xl:gap-8">
          <PackageGallery
            images={packageItem.imageURL ?? []}
            name={packageItem.name}
          />
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge>
                  <Package className="mr-1 size-3" />
                  Package
                </Badge>
                <Badge variant="secondary">
                  {packageItem.items.length} outfits
                </Badge>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">
                {packageItem.name}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Build your package step by step: pick an outfit, choose a color,
                pick a size, then set the quantity.
              </p>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/20 p-2.5">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Package className="size-3.5" /> Included outfits
                </p>
                <p className="mt-0.5 font-semibold">
                  {packageItem.items.length}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-2.5">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shirt className="size-3.5" /> Available pieces
                </p>
                <p className="mt-0.5 font-semibold">
                  {outfits.reduce((sum, outfit) => sum + totalStock(outfit), 0)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <Separator className="h-0.5 bg-border" />

        {selections.length > 0 && <SelectionSummary />}

        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">
              Let&apos;s build your package.
            </h2>
            <p className="text-sm text-muted-foreground">
              Fill each outfit with the minimum amount.
            </p>
          </div>

          <StepIndicator currentStep={currentStep} />

          {allOutfitsComplete ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-5 text-sm text-green-800">
              All outfits are at their minimum quantity. You can review your
              selections below or add the package to your cart.
            </div>
          ) : null}

          {currentStep === "outfit" && <OutfitPickerStep />}
          {currentStep === "color" && <ColorPickerStep />}
          {currentStep === "size" && <SizePickerStep />}
          {currentStep === "amount" && <AmountPickerStep />}
        </section>
      </div>

      <PackagePriceFooter
        mode={packageItem.mode}
        lines={selectionLines}
        totals={packageTotals}
        expanded={priceBreakdownExpanded}
        onToggle={() => setPriceBreakdownExpanded((current) => !current)}
        onAddToCart={handleAddToCart}
      />
    </main>
  );
}

export default function BrowsePackagePage() {
  const params = useParams<{packageSlug?: string | string[]}>();
  const rawSlug = Array.isArray(params.packageSlug)
    ? params.packageSlug[0]
    : params.packageSlug;

  const packageId = rawSlug ? getIdFromSlug(rawSlug) : "";

  const {
    data: packageItem,
    isLoading,
    isError,
  } = useQuery<IPackage>({
    queryKey: ["package", packageId],
    queryFn: () => fetchPackageById(packageId),
    enabled: Boolean(packageId),
  });

  const outfitQueries = useQueries({
    queries: (packageItem?.items ?? []).map((item) => ({
      queryKey: ["outfit", item._id],
      queryFn: async () => (await fetchOutfitById(item._id)).data as IOutfit,
      enabled: Boolean(item._id),
    })),
  });

  const outfits = outfitQueries.flatMap((query) =>
    query.data ? [query.data] : [],
  );

  const isLoadingOutfits = outfitQueries.some((query) => query.isLoading);

  if (isLoading || !packageId || isLoadingOutfits)
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground">
        Loading package...
      </div>
    );
  if (isError || !packageItem)
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground">
        Unable to find this package.
      </div>
    );

  return (
    <PackageProvider packageItem={packageItem} outfits={outfits}>
      <BrowsePackageContent packageItem={packageItem} outfits={outfits} />
    </PackageProvider>
  );
}
