"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {useParams} from "next/navigation";
import {useMemo, useState} from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {CalendarClock, ChevronLeft, CreditCard, Package} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
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
import {addToPackageCartService} from "@/features/user-dashboard/package/services/packageCartService";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {getIdFromSlug} from "@/lib/slug";

const FALLBACK_IMAGE = "/assets/images/landing-page/suit.jpg";

function formatPrice(value?: number) {
  return `₱${(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

function PackagePriceFooter({
  mode,
  totals,
  onAddToCart,
}: {
  mode: IPackage["mode"];
  totals: {purchaseTotal: number; rentalTotal: number};
  onAddToCart: () => void;
}) {
  const showPurchase = mode === "purchase" || mode === "both";
  const showRental = mode === "rental" || mode === "both";

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground">
            Package total
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-base font-semibold tabular-nums">
            {showPurchase && (
              <span className="flex items-center gap-1.5">
                <CreditCard
                  className="size-4 text-muted-foreground"
                  aria-label="Purchase total"
                />
                {formatPrice(totals.purchaseTotal)}
              </span>
            )}
            {showRental && (
              <span className="flex items-center gap-1.5">
                <CalendarClock
                  className="size-4 text-muted-foreground"
                  aria-label="Rent total"
                />
                {formatPrice(totals.rentalTotal)}
              </span>
            )}
          </div>
        </div>
        <Button
          type="button"
          size="lg"
          className="w-full shrink-0 cursor-pointer sm:w-auto sm:min-w-52"
          onClick={onAddToCart}
        >
          Add to cart
        </Button>
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
  const client = useQueryClient();
  const {user} = useAuth();
  const {currentStep, selections, isOutfitComplete, buildPackagePayload} =
    usePackage();

  const addToCartMutation = useMutation({
    mutationFn: addToPackageCartService,
    onSuccess: () => {
      client.invalidateQueries({queryKey: ["package"]});
      notify({
        title: "Package added to cart",
        description: `${selections.length} item${selections.length === 1 ? "" : "s"} added to your package cart.`,
        variant: "success",
      });
    },
    onError: (error) => {
      notify({
        title: "Package add failed",
        description:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error as any)?.response?.data?.message ??
          "Unable to add this package to your cart.",
        variant: "error",
      });
    },
  });

  const packageTotals = useMemo(
    () =>
      selections.reduce(
        (totals, sel) => ({
          purchaseTotal:
            totals.purchaseTotal + sel.purchasePrice * sel.quantity,
          rentalTotal: totals.rentalTotal + sel.rentalPrice * sel.quantity,
        }),
        {purchaseTotal: 0, rentalTotal: 0},
      ),
    [selections],
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

    // mutate (not mutateAsync): onError above handles the failure toast.
    addToCartMutation.mutate({
      userId: user?._id || "",
      packageItems: [buildPackagePayload(selections)],
    });
  };

  const showPurchaseTotal =
    (packageItem.mode === "purchase" || packageItem.mode === "both") &&
    (packageItem.purchaseTotal ?? 0) > 0;
  const showRentalTotal =
    (packageItem.mode === "rental" || packageItem.mode === "both") &&
    (packageItem.rentalTotal ?? 0) > 0;

  const packagePriceBlock = (
    <div className="grid gap-4 sm:grid-cols-2">
      {showPurchaseTotal ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            <CreditCard className="size-3.5" />
            Purchase
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-foreground">
            {formatPrice(packageItem.purchaseTotal)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            one-time purchase
          </p>
        </div>
      ) : null}

      {showRentalTotal ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            <CalendarClock className="size-3.5" />
            Rent
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-foreground">
            {formatPrice(packageItem.rentalTotal)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            per rental period
          </p>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-6 pb-36">
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
          {packagePriceBlock}
          <div className="grid gap-2 text-sm">
            <div className="rounded-lg border bg-muted/20 p-2.5">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Package className="size-3.5" /> Included outfits
              </p>
              <p className="mt-0.5 font-semibold">{packageItem.items.length}</p>
            </div>
          </div>
        </div>
      </section>

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

      {selections.length > 0 && <SelectionSummary />}

      <PackagePriceFooter
        mode={packageItem.mode}
        totals={packageTotals}
        onAddToCart={handleAddToCart}
      />
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
      queryFn: () => fetchOutfitById(item._id),
      enabled: Boolean(item._id),
    })),
  });

  const outfits = outfitQueries.flatMap((query) =>
    query.data ? [query.data] : [],
  );

  const isLoadingOutfits = outfitQueries.some((query) => query.isLoading);

  if (isLoading || !packageId || isLoadingOutfits)
    return (
      <div className="py-10 text-sm text-muted-foreground">
        Loading package...
      </div>
    );
  if (isError || !packageItem)
    return (
      <div className="py-10 text-sm text-muted-foreground">
        Unable to find this package.
      </div>
    );

  return (
    <PackageProvider packageItem={packageItem} outfits={outfits}>
      <BrowsePackageContent packageItem={packageItem} outfits={outfits} />
    </PackageProvider>
  );
}
