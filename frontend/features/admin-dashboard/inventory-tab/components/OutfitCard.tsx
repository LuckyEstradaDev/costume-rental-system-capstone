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
  const totalStock =
    data.variants?.reduce(
      (sum, v) => sum + v.sizes.reduce((s, sz) => s + sz.stock, 0),
      0,
    ) ?? 0;

  return (
    // `relative` here is what CardDropdownMenu's `absolute top-3 right-3` anchors to
    <Card className="group relative overflow-hidden border-0 shadow-sm ring-1 ring-border/60 transition-all duration-200 hover:shadow-md hover:ring-border">
      {/* Ellipsis dropdown — absolute inside `relative` Card, always visible */}
      <CardDropdownMenu outfit={data} />

      <div className="flex flex-col sm:flex-row">
        {/* ── Image ── */}
        <div className="relative shrink-0 overflow-hidden sm:w-44">
          <Image
            src={
              data.imageURL?.toString() ||
              "/assets/images/landing-page/suit.jpg"
            }
            alt={data.name}
            width={500}
            height={500}
            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] sm:h-full sm:min-h-[10rem]"
          />
          {/* Stock badge overlay */}
          <div className="absolute bottom-2 left-2">
            <Badge
              variant={totalStock === 0 ? "destructive" : "secondary"}
              className="gap-1 text-[11px] shadow-sm"
            >
              <PackageCheck className="size-3" />
              {totalStock === 0 ? "Out of stock" : `${totalStock} in stock`}
            </Badge>
          </div>
        </div>

        {/* ── Content ── */}
        <CardContent className="flex flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
          {/* Top: name + category — pr-10 leaves room for the absolute dropdown button */}
          <div className="space-y-2 pr-10">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base leading-snug">
                {data.name}
              </CardTitle>
              <Badge
                variant="outline"
                className="rounded-full text-xs font-medium"
              >
                {data.category}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2 text-sm leading-relaxed">
              {data.description}
            </CardDescription>
          </div>

          {/* Bottom: price + variants */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            {/* Price */}
            <div className="flex items-baseline gap-1">
              <PhilippinePeso className="size-3.5 self-center text-muted-foreground" />
              <span className="text-xl font-bold tabular-nums text-foreground">
                {data.price}
              </span>
              <span className="text-xs text-muted-foreground">/ day</span>
            </div>

            {/* Variant pills */}
            {data.variants && data.variants.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {data.variants.map((variant, index) => {
                  const variantStock = variant.sizes.reduce(
                    (total, s) => total + s.stock,
                    0,
                  );
                  const isOutOfStock = variantStock === 0;

                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                        isOutOfStock
                          ? "border-border/40 bg-muted/30 text-muted-foreground/50 line-through"
                          : "border-border/60 bg-background hover:bg-muted/40"
                      }`}
                    >
                      <span
                        className="size-2.5 rounded-full border border-border/40 shadow-sm"
                        style={{backgroundColor: variant.color}}
                        title={variant.color}
                      />
                      <span className="font-medium">
                        {variant.sizes.map((s) => s.size).join(", ")}
                      </span>
                      <span className="h-3 w-px bg-border/60" />
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {variantStock}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
