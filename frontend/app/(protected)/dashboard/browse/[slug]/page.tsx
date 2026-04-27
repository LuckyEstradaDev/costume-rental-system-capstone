"use client";

import Image from "next/image";
import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import {CalendarClock, Package, Palette, Ruler} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
  IOutfit,
  Variant,
} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {fetchOutfitById} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {addToCartService} from "@/features/user-dashboard/cart/services/cartService";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {ICartItem} from "@/features/user-dashboard/cart/types/ICart";

export default function BrowseOutfitPage() {
  const [currentOutfit, setCurrentOutfit] = useState<IOutfit>();
  const [selectedSize, setSelectedSize] = useState<string>();
  const {user} = useAuth();
  const [selectedVariant, setSelectedVariant] = useState<Variant>();

  //get slug
  const params = useParams<{slug?: string | string[]}>();

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  //separate slug
  const getIdFromSlug = (slug: string) => {
    const slugArray = slug.split("-");
    return slugArray[slugArray.length - 1];
  };

  //fetch outfit
  useEffect(() => {
    if (!slug) {
      return;
    }

    const fetchOutfit = async () => {
      try {
        const {data} = await fetchOutfitById(getIdFromSlug(slug!));
        setCurrentOutfit(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchOutfit();
  }, [slug]);

  const handleColorSelect = (variant: Variant) => {
    setSelectedVariant(variant);
    setSelectedSize(undefined);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || !selectedSize) {
      alert("Please select a color and size first.");
      return;
    }

    if (
      selectedVariant?.sizes.find((s) => s.size === selectedSize)?.stock === 0
    ) {
      alert("Selected variant and size is out of stock.");
      return;
    }

    const cartForm: ICartItem = {
      userId: user?._id || "",
      items: [
        {
          outfitId: currentOutfit?._id || "",
          variantId: selectedVariant?._id || "",
          size: selectedSize || "",
          color: selectedVariant?.color || "",
          quantity: 1,
          name: currentOutfit?.name || "",
          category: currentOutfit?.category || "",
          imageURL:
            typeof currentOutfit?.imageURL === "string"
              ? currentOutfit.imageURL
              : "/assets/images/landing-page/suit.jpg",
          price: currentOutfit?.price || "0",
        },
      ],
    };

    if (cartForm) {
      await addToCartService(cartForm);
    }
  };
  //render
  const outfitImage =
    typeof currentOutfit?.imageURL === "string"
      ? currentOutfit.imageURL
      : "/assets/images/landing-page/suit.jpg";
  const totalStock =
    currentOutfit?.variants.reduce(
      (total, variant) =>
        total +
        variant.sizes.reduce(
          (variantTotal, size) => variantTotal + size.stock,
          0,
        ),
      0,
    ) ?? 0;
  const activeSizes = selectedVariant?.sizes ?? [];
  const selectedSizeStock =
    activeSizes.find((size) => size.size === selectedSize)?.stock ?? null;
  const hasVariants = (currentOutfit?.variants.length ?? 0) > 0;
  const buyingPrice = currentOutfit?.price
    ? `PHP ${currentOutfit.price}`
    : "Not set";
  const rentalPrice = currentOutfit?.rentalPrice
    ? `PHP ${currentOutfit.rentalPrice}`
    : "Not set";
  const canAddToCart =
    Boolean(selectedVariant) &&
    Boolean(selectedSize) &&
    selectedSizeStock !== null &&
    selectedSizeStock > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] xl:gap-12">
          <section className="space-y-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-muted sm:aspect-[16/11]">
              <Image
                src={outfitImage}
                alt={currentOutfit?.name || "Outfit"}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="grid gap-4 border-t pt-5 text-sm sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Category
                </p>
                <p className="font-medium text-foreground">
                  {currentOutfit?.category || "Not specified"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Variants
                </p>
                <p className="font-medium text-foreground">
                  {hasVariants
                    ? currentOutfit?.variants.length
                    : "Not available"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Total Stock
                </p>
                <p className="font-medium text-foreground">
                  {totalStock > 0 ? totalStock : "Not available"}
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-8">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {currentOutfit?.category || "Uncategorized"}
                </Badge>
                <Badge variant={totalStock > 0 ? "outline" : "destructive"}>
                  {totalStock > 0 ? "Available" : "Out of stock"}
                </Badge>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
                  {currentOutfit?.name || "Outfit name not available"}
                </h1>

                <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                  {currentOutfit?.description ||
                    "No description available yet."}
                </p>
              </div>
            </div>

            <div className="grid gap-4 border-y py-6 sm:grid-cols-2">
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-900">
                  <Package className="size-4" />
                  Buying Price
                </div>
                <p className="text-3xl font-semibold text-amber-950">
                  {buyingPrice}
                </p>
                <p className="mt-2 text-sm text-amber-800/80">
                  Best for customers who want to own the outfit.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-900">
                  <CalendarClock className="size-4" />
                  Rental Price
                </div>
                <p className="text-3xl font-semibold text-emerald-950">
                  {rentalPrice}
                </p>
                <p className="mt-2 text-sm text-emerald-800/80">
                  Per day rental rate.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Palette className="size-4 text-muted-foreground" />
                  <span>Colors</span>
                </div>

                {hasVariants ? (
                  <div className="flex flex-wrap gap-2">
                    {currentOutfit?.variants.map((variant) => {
                      const color = variant.color || "Unnamed color";
                      const isActive = selectedVariant?._id === variant._id;

                      return (
                        <button
                          key={variant._id ?? color}
                          onClick={() => handleColorSelect(variant)}
                          className={`rounded-full border px-4 py-2 text-sm transition ${
                            isActive
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background hover:border-foreground/40 hover:bg-muted/50"
                          }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed px-4 py-5 text-sm text-muted-foreground">
                    No color variants available.
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Ruler className="size-4 text-muted-foreground" />
                  <span>Sizes</span>
                </div>

                {!selectedVariant ? (
                  <div className="rounded-xl border border-dashed px-4 py-5 text-sm text-muted-foreground">
                    Select a color to view available sizes.
                  </div>
                ) : activeSizes.length === 0 ? (
                  <div className="rounded-xl border border-dashed px-4 py-5 text-sm text-muted-foreground">
                    Not available.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {activeSizes.map((sizeOption) => {
                      const size = sizeOption.size || "No size";
                      const isSelected = selectedSize === sizeOption.size;
                      const isAvailable = sizeOption.stock > 0;

                      return (
                        <button
                          key={`${selectedVariant._id ?? selectedVariant.color}-${size}-${sizeOption.stock}`}
                          onClick={() =>
                            isAvailable && handleSizeSelect(sizeOption.size)
                          }
                          disabled={!isAvailable}
                          className={`rounded-md border px-4 py-2 text-sm transition ${
                            isSelected && isAvailable
                              ? "border-primary bg-primary text-primary-foreground"
                              : ""
                          } ${
                            !isSelected && isAvailable
                              ? "border-border bg-background hover:border-foreground/40 hover:bg-muted/50"
                              : ""
                          } ${
                            !isAvailable
                              ? "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-70"
                              : "cursor-pointer"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 border-t pt-6 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Selection Status
                </p>
                <p className="text-sm text-foreground">
                  {selectedVariant
                    ? selectedSize
                      ? `${selectedVariant.color || "Selected color"} / ${selectedSize}`
                      : `${selectedVariant.color || "Selected color"} chosen`
                    : "No color selected"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Stock Availability
                </p>
                <p className="text-sm text-foreground">
                  {selectedVariant
                    ? selectedSize
                      ? selectedSizeStock && selectedSizeStock > 0
                        ? `${selectedSizeStock} piece(s) available`
                        : "Not available"
                      : "Select a size to view stock"
                    : "Select a color first"}
                </p>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              className="w-full md:w-auto md:min-w-56"
              size="lg"
              disabled={!canAddToCart}
            >
              Add to Cart
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
