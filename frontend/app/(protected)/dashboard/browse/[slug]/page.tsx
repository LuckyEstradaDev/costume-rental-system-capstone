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
                    ).map((color) => (
                      <button
                        key={color}
                        className="px-4 py-2 rounded-full border text-sm hover:border-black transition"
                      >
                        {color}
                      </button>
                    ))}
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
                    ).map((size) => (
                      <button
                        key={size}
                        className="px-4 py-2 rounded-md border text-sm hover:border-black transition"
                      >
                        {size}
                      </button>
                    ))}
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
                Reserve Now
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
