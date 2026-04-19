"use client";

import Image from "next/image";
import {useEffect, useState} from "react";
import {useParams} from "next/navigation";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {fetchOutfitById} from "@/features/admin-dashboard/inventory-tab/services/outfitService";

export default function BrowseOutfitPage() {
  const [currentOutfit, setCurrentOutfit] = useState<IOutfit>();
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>();
  const [selectedSize, setSelectedSize] = useState<string>();

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
    const fetchOutfit = async () => {
      try {
        const {data} = await fetchOutfitById(getIdFromSlug(slug!));
        setCurrentOutfit(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchOutfit();
  }, [params]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const sameColors = currentOutfit?.variants.filter(
      (item) => item.color == color && item,
    );

    setAvailableSizes(sameColors!.map((item) => item.size));
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  //render
  const outfitImage =
    typeof currentOutfit?.imageURL === "string"
      ? currentOutfit.imageURL
      : "/assets/images/landing-page/suit.jpg";

  const firstVariant = currentOutfit?.variants?.[0];
  return (
    <div className="mx-auto max-w-6xl p-4 md:p-10">
      <Card className="overflow-hidden rounded-2xl border-border/50 shadow-lg">
        <div className="grid md:grid-cols-2">
          <div className="relative h-[24rem] md:h-full bg-muted">
            <Image
              src={outfitImage}
              alt={currentOutfit?.name || "Outfit"}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="flex flex-col justify-between p-6 md:p-10">
            <div className="space-y-6">
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {currentOutfit?.category || "Formal Wear"}
                </Badge>
                <Badge variant="outline">In Stock</Badge>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                  {currentOutfit?.name || "Premium Black Tuxedo"}
                </h1>

                <p className="text-muted-foreground leading-relaxed">
                  {currentOutfit?.description ||
                    "A modern tailored tuxedo perfect for weddings, formal events, and special occasions. Clean fit with premium fabric finish."}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-2">Color</p>

                  <div className="flex flex-wrap gap-2">
                    {(currentOutfit?.variants?.length
                      ? Array.from(
                          new Set(
                            currentOutfit.variants.map(
                              (variant) => variant.color,
                            ),
                          ),
                        )
                      : ["Black", "Navy", "Gray"]
                    ).map((color) => {
                      const isActive = selectedColor === color;

                      return (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          className={`
            px-4 py-2 rounded-full border text-sm transition

            ${
              isActive
                ? "border-primary bg-primary text-white"
                : "border-gray-300 bg-white hover:border-black hover:bg-gray-50"
            }
          `}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-2">Size</p>

                  <div className="flex flex-wrap gap-2">
                    {(currentOutfit?.variants?.length
                      ? Array.from(
                          new Set(
                            currentOutfit.variants.map(
                              (variant) => variant.size,
                            ),
                          ),
                        )
                      : ["S", "M", "L", "XL"]
                    ).map((size) => {
                      const isAvailable = availableSizes.includes(size);
                      const isSelected = selectedSize === size;

                      return (
                        <button
                          key={size}
                          onClick={() => isAvailable && setSelectedSize(size)}
                          disabled={!isAvailable}
                          className={`
          px-4 py-2 rounded-md border text-sm transition-all duration-150

          ${
            isSelected && isAvailable
              ? "border-primary bg-primary text-white scale-105"
              : ""
          }

          ${
            !isSelected && isAvailable
              ? "border-gray-300 bg-white hover:border-black hover:bg-gray-50"
              : ""
          }

          ${
            !isAvailable
              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
              : "cursor-pointer"
          }
        `}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {firstVariant
                  ? `Available stock: ${firstVariant.stock}`
                  : "Select a size and color to see availability"}
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold">₱{currentOutfit?.price}</p>
                <span className="text-sm text-muted-foreground mb-1">
                  / day
                </span>
              </div>

              <Button className="w-full" size="lg">
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
