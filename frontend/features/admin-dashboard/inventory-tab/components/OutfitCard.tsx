import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {
  MoreHorizontal,
  PackageCheck,
  PhilippinePeso,
  Palette,
} from "lucide-react";
import {IOutfit} from "../types/IOutfit";

export default function OutfitCard({data}: {data: IOutfit}) {
  return (
    <Card className="group overflow-hidden border-border/70 transition-all hover:shadow-md">
      <div className="relative flex flex-col gap-4 px-4 sm:flex-row">
        {/* options */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>

        {/* image */}
        <Image
          src={
            data.imageURL?.toString() || "/assets/images/landing-page/suit.jpg"
          }
          alt="Outfit"
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
                  {data.category}
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

              {/* sizes */}
              {/* <div className="flex items-center gap-2">
                {sizes.map((size) => (
                  <span
                    key={size}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium"
                  >
                    {size}
                  </span>
                ))}
              </div> */}
            </div>

            {/* COLORS */}
            {/* <div className="flex items-center justify-end">
              <div className="flex gap-2">
                {colors.map((color) => (
                  <span
                    key={color.name}
                    className={`h-6 w-6 rounded-full shadow-sm ring-1 ring-black/5 ${color.className}`}
                    title={color.name}
                  />
                ))}
              </div>
            </div> */}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
