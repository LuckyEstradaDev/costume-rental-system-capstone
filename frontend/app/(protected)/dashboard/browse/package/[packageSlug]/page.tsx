"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {useParams} from "next/navigation";
import {useMemo, useState} from "react";
import {useQueries, useQuery} from "@tanstack/react-query";
import {
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  Package,
  Palette,
  Shirt,
  ShoppingCart,
} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
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

type SelectionLine = {
  outfit: IOutfit;
  variantName: string;
  sizeName: string;
  quantity: number;
  purchasePrice: number;
  rentalPrice: number;
};

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

function VariantQuantityInputs({
  outfit,
  minimumQuantity,
  quantities,
  onQuantityChange,
}: {
  outfit: IOutfit;
  minimumQuantity: number;
  quantities: Record<string, Record<string, number>>;
  onQuantityChange: (
    variantId: string,
    size: string,
    quantity: number,
  ) => void;
}) {
  const selectedQuantity = outfit.variants.reduce(
    (total, variant, index) =>
      total +
      Object.values(quantities[variant._id ?? `${index}`] ?? {}).reduce(
        (variantTotal, quantity) => variantTotal + quantity,
        0,
      ),
    0,
  );

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-3 border-b pb-2">
        <div>
          <p className="text-sm font-semibold">Variant quantities</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Set how many units of each color should be included.
          </p>
        </div>
        <Badge variant={selectedQuantity >= minimumQuantity ? "secondary" : "outline"}>
          {selectedQuantity} / {minimumQuantity}
        </Badge>
      </div>
      <div className="divide-y rounded-md border bg-background">
        {outfit.variants.length ? (
          outfit.variants.map((variant, index) => {
            const variantId = variant._id ?? `${index}`;
            const variantQuantities = quantities[variantId] ?? {};
            const variantQuantity = Object.values(variantQuantities).reduce(
              (total, quantity) => total + quantity,
              0,
            );
            const remainingQuantity = Math.max(
              0,
              minimumQuantity - selectedQuantity + variantQuantity,
            );
            return (
              <details key={variantId} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    <Palette className="size-3.5 text-muted-foreground" />
                    {variant.color || "Unnamed color"}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {variantQuantity} added
                    <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                  </span>
                </summary>
                <div className="space-y-2 border-t bg-muted/20 px-3 py-3">
                  <p className="text-xs text-muted-foreground">
                    {remainingQuantity} more available for this outfit minimum.
                  </p>
                  {variant.sizes.map((sizeOption) => {
                    const sizeQuantity = variantQuantities[sizeOption.size] ?? 0;
                    const maxQuantity = Math.min(
                      sizeOption.stock,
                      remainingQuantity + sizeQuantity,
                    );
                    return (
                      <div
                        key={`${variantId}-${sizeOption.size}`}
                        className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium">Size {sizeOption.size}</p>
                          <p className="text-xs text-muted-foreground">
                            {sizeOption.stock > 0
                              ? `${sizeOption.stock} available`
                              : "Out of stock"}
                          </p>
                        </div>
                        <Input
                          aria-label={`${variant.color || "Variant"} size ${sizeOption.size} quantity`}
                          type="number"
                          min="0"
                          max={maxQuantity}
                          value={sizeQuantity}
                          onChange={(event) =>
                            onQuantityChange(
                              variantId,
                              sizeOption.size,
                              Number(event.target.value),
                            )
                          }
                          disabled={sizeOption.stock === 0}
                          className="w-20 tabular-nums"
                        />
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          })
        ) : (
          <p className="px-3 py-4 text-xs text-muted-foreground">
            No color variants available.
          </p>
        )}
      </div>
    </div>
  );
}

function OutfitDetails({
  outfit,
  packageMode,
  minimumQuantity,
  quantities,
  onQuantityChange,
}: {
  outfit: IOutfit;
  packageMode: IPackage["mode"];
  minimumQuantity: number;
  quantities: Record<string, number>;
  onQuantityChange: (
    variantId: string,
    size: string,
    quantity: number,
  ) => void;
}) {
  const detailSlug = buildOutfitSlug(outfit.name, outfit._id);
  const purchasePrice = Number(outfit.purchasePackagePrice) || 0;
  const rentalPrice = Number(outfit.rentalPackagePrice) || 0;
  return (
    <article className="space-y-3 rounded-xl border bg-background p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-28">
          <img
            src={
              typeof outfit.imageURL === "string"
                ? outfit.imageURL
                : FALLBACK_IMAGE
            }
            alt={outfit.name}
            className="size-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          {detailSlug ? (
            <Link
              href={`/dashboard/browse/${detailSlug}`}
              className="text-lg font-semibold tracking-tight text-primary underline underline-offset-4 sm:text-xl"
            >
              {outfit.name}
            </Link>
          ) : (
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
              {outfit.name}
            </h2>
          )}
          <div className="flex flex-wrap gap-2">
            <Badge>{outfit.category}</Badge>
            {outfit.fabricType && (
              <Badge variant="secondary">{outfit.fabricType}</Badge>
            )}
            <Badge variant={totalStock(outfit) > 0 ? "outline" : "destructive"}>
              {totalStock(outfit) > 0
                ? `${totalStock(outfit)} available`
                : "Out of stock"}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {(packageMode === "purchase" || packageMode === "both") && (
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <Package className="size-3.5" /> Buy{" "}
                {formatPrice(purchasePrice)}
              </span>
            )}
            {(packageMode === "rental" || packageMode === "both") && (
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <CalendarClock className="size-3.5" /> Rent{" "}
                {formatPrice(rentalPrice)}
              </span>
            )}
          </div>
        </div>

        <div className="flex w-full items-center gap-2.5 rounded-lg border-2 border-primary/35 bg-primary/10 px-3 py-2.5 text-left sm:ml-auto sm:w-auto sm:min-w-40 sm:self-start">
          <Package className="size-4 shrink-0 text-primary" />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-primary">
              Minimum required
            </p>
            <p className="text-sm font-semibold text-foreground">
              {minimumQuantity} {minimumQuantity === 1 ? "unit" : "units"}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-3 border-t pt-3">
        <VariantQuantityInputs
          outfit={outfit}
          minimumQuantity={minimumQuantity}
          quantities={quantities}
          onQuantityChange={onQuantityChange}
        />
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
                <p className="text-xs text-muted-foreground">
                  Package totals are calculated from the selected package items.
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {lines.length} item{lines.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="divide-y rounded-lg border bg-background text-sm">
              {lines.map(
                ({
                  outfit,
                  variantName,
                  sizeName,
                  quantity,
                  purchasePrice,
                  rentalPrice,
                }) => (
                  <div
                    key={`${outfit._id ?? outfit.name}-${variantName}-${sizeName}`}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5"
                  >
                    <span className="min-w-0 truncate">
                      {outfit.name} - {variantName}, size {sizeName} ({quantity})
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
  const {notify} = useNotification();
  const [quantities, setQuantities] = useState<
    Record<string, Record<string, Record<string, number>>>
  >({});
  const [priceBreakdownExpanded, setPriceBreakdownExpanded] = useState(false);

  const selectionLines = useMemo(() => {
    return outfits.flatMap((outfit, outfitIndex) => {
      const outfitKey = getOutfitKey(outfit, outfitIndex);
      return outfit.variants.flatMap((variant, variantIndex) => {
        const variantId = variant._id ?? `${variantIndex}`;
        return variant.sizes.flatMap((sizeOption) => {
          const quantity =
            quantities[outfitKey]?.[variantId]?.[sizeOption.size] ?? 0;
          return quantity > 0
            ? [{
                outfit,
                variantName: variant.color || "Unnamed color",
                sizeName: sizeOption.size,
                quantity,
                purchasePrice: Number(outfit.purchasePackagePrice) || 0,
                rentalPrice: Number(outfit.rentalPackagePrice) || 0,
              }]
            : [];
        });
      });
    });
  }, [outfits, quantities]);

  const selectedPackageTotals = useMemo(
    () =>
      selectionLines.reduce(
        (totals, line) => ({
          purchaseTotal:
            totals.purchaseTotal + line.purchasePrice * line.quantity,
          rentalTotal:
            totals.rentalTotal + line.rentalPrice * line.quantity,
        }),
        {purchaseTotal: 0, rentalTotal: 0},
      ),
    [selectionLines],
  );

  const handleQuantityChange = (
    outfitKey: string,
    variantId: string,
    size: string,
    quantity: number,
  ) => {
    const outfit = outfits.find((item, index) => getOutfitKey(item, index) === outfitKey);
    const minimumQuantity =
      packageItem?.items.find((item) => item._id === outfit?._id)
        ?.minimumQuantity ?? 1;
    const currentQuantities = quantities[outfitKey] ?? {};
    const selectedQuantity = Object.values(currentQuantities).reduce(
      (total, sizeQuantities) =>
        total +
        Object.values(sizeQuantities).reduce((sum, value) => sum + value, 0),
      0,
    );
    const currentSizeQuantity = currentQuantities[variantId]?.[size] ?? 0;
    const maximum = Math.max(
      0,
      minimumQuantity - selectedQuantity + currentSizeQuantity,
    );
    setQuantities((current) => ({
      ...current,
      [outfitKey]: {
        ...current[outfitKey],
        [variantId]: {
          ...current[outfitKey]?.[variantId],
          [size]: Math.min(
            maximum,
            Math.max(0, Number.isFinite(quantity) ? quantity : 0),
          ),
        },
      },
    }));
  };

  const handleAddToCart = () => {
    const belowMinimum = outfits.find((outfit, index) => {
      const outfitKey = getOutfitKey(outfit, index);
      const minimumQuantity =
        packageItem?.items.find((item) => item._id === outfit._id)
          ?.minimumQuantity ?? 1;
      const selectedQuantity = Object.values(quantities[outfitKey] ?? {}).reduce(
        (total, sizeQuantities) =>
          total + Object.values(sizeQuantities).reduce((sum, value) => sum + value, 0),
        0,
      );
      return selectedQuantity < minimumQuantity;
    });
    if (belowMinimum) {
      notify({
        title: "Meet the minimum quantity",
        description: `Add enough ${belowMinimum.name} variants to meet the package minimum.`,
        variant: "warning",
      });
      return;
    }
    notify({
      title: "Package selections ready",
      description:
        "Your package items are complete. Cart saving will be connected next.",
      variant: "success",
    });
  };

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
                Choose how many pieces of each color variant to include.
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
        <section className="space-y-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Included outfits
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Enter quantities for the variants you want in each outfit.
            </p>
          </div>
          {outfits.map((outfit, index) => {
            const outfitKey = getOutfitKey(outfit, index);
            return (
              <OutfitDetails
                key={outfitKey}
                outfit={outfit}
                packageMode={packageItem.mode}
                minimumQuantity={
                  packageItem.items.find((item) => item._id === outfit._id)
                    ?.minimumQuantity ?? 1
                }
                quantities={quantities[outfitKey] ?? {}}
                onQuantityChange={(variantId, size, quantity) =>
                  handleQuantityChange(outfitKey, variantId, size, quantity)
                }
              />
            );
          })}
        </section>
      </div>
      <PackagePriceFooter
        mode={packageItem.mode}
        lines={selectionLines}
        totals={selectedPackageTotals}
        expanded={priceBreakdownExpanded}
        onToggle={() => setPriceBreakdownExpanded((current) => !current)}
        onAddToCart={handleAddToCart}
      />
    </main>
  );
}
