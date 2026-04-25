import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {PackageCheck, PhilippinePeso} from "lucide-react";

import {IOutfit} from "../types/IOutfit";
import {CardDropdownMenu} from "./CardDropdownMenu";

export default function OutfitCard({data}: {data: IOutfit}) {
  const hasAnyOutOfStockSizePerVariant = data.variants?.every((variant) =>
    variant.sizes.some((s) => s.stock === 0),
  );
  return (
    <Card className="group overflow-hidden border-border/70 transition-all hover:shadow-md">
      <div className="relative flex flex-col gap-4 px-4 sm:flex-row">
        {/* options */}
        <CardDropdownMenu outfit={data} />

        {/* image */}
        <Image
          src={
            data.imageURL?.toString() || "/assets/images/landing-page/suit.jpg"
          }
          alt={data.name}
          width={500}
          height={500}
          className="min-h-36 min-w-[10rem] w-full rounded-xl object-cover sm:h-40 sm:w-44"
        />

        <CardContent className="w-full px-0 pb-0 sm:pt-1">
          <div className="space-y-4">
            {/* HEADER */}
            <div className="space-y-2 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">{data.name}</CardTitle>

                <Badge variant="secondary">{data.category}</Badge>

                {/* stock */}
                <Badge variant="outline" className="gap-1">
                  <PackageCheck className="h-3.5 w-3.5" />
                  {/* {data.stock ?? 0} */}
                </Badge>
              </div>

              {/* description */}
              <CardDescription className="line-clamp-2 text-sm">
                {data.description}
              </CardDescription>
            </div>

            {/* PRICE + ATTRIBUTES */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* price */}
              <div className="flex items-center gap-2 text-sm">
                <PhilippinePeso className="h-4 w-4 text-muted-foreground" />
                <span className="text-base font-semibold">{data.price}</span>
                <span className="text-muted-foreground">/ day</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {data.variants?.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs transition
        ${
          hasAnyOutOfStockSizePerVariant
            ? "border-border/50 bg-muted/40 text-muted-foreground line-through"
            : "border-border/70 bg-background hover:bg-muted/60"
        }`}
                  >
                    size
                    {/* stock */}
                    <span className="text-[11px] text-muted-foreground">
                      {item.sizes
                        .map((s) => s.stock)
                        .reduce((a, b) => a + b, 0)}{" "}
                      in stock
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
