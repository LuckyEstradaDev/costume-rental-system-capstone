"use client";

import Image from "next/image";
import {useEffect, useMemo, useState} from "react";
import {useParams} from "next/navigation";

import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {fetchOutfitsService} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";

export default function BrowseOutfitPage() {
  const params = useParams<{slug?: string | string[]}>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const outfitId = useMemo(() => getOutfitIdFromSlug(slug ?? ""), [slug]);

  const [outfit, setOutfit] = useState<IOutfit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutfit = async () => {
      if (!outfitId) {
        setLoading(false);
        return;
      }

      try {
        const {data} = await fetchOutfitsService();
        const match = data.find((item: IOutfit) => item._id === outfitId) ?? null;
        setOutfit(match);
      } finally {
        setLoading(false);
      }
    };

    fetchOutfit();
  }, [outfitId]);

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading outfit...</div>;
  }

  if (!outfit) {
    return (
      <div className="p-6">
        <p className="text-lg font-semibold">Outfit not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The slug did not match an available outfit.
        </p>
      </div>
    );
  }

  const imageSrc =
    typeof outfit.imageURL === "string"
      ? outfit.imageURL
      : "/assets/images/landing-page/suit.jpg";

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[22rem] bg-muted">
          <Image
            src={imageSrc}
            alt={outfit.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="p-6">
          <CardHeader className="px-0 pt-0">
            <Badge variant="secondary" className="w-fit">
              {outfit.category}
            </Badge>
            <CardTitle className="text-2xl">{outfit.name}</CardTitle>
            <CardDescription>{outfit.description}</CardDescription>
          </CardHeader>

          <CardContent className="px-0 pt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Price
              </p>
              <p className="text-3xl font-semibold">
                {outfit.price ?? "Contact for price"}
                <span className="ml-2 text-sm font-normal text-muted-foreground">/ day</span>
              </p>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}

function getOutfitIdFromSlug(slug: string) {
  const lastDashIndex = slug.lastIndexOf("-");

  if (lastDashIndex === -1) {
    return slug;
  }

  return slug.slice(lastDashIndex + 1);
}
