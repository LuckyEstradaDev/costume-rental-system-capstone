"use client";

import {useState} from "react";
import Image from "next/image";
import {
  MoreHorizontal,
  PackageCheck,
  Pencil,
  PhilippinePeso,
  Trash,
} from "lucide-react";
import {AlertDialogComponent} from "@/components/AlertDialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useNotification} from "@/components/ui/alert";
import {deletePackageService} from "../services/PackageService";
import type {IPackage} from "../types/IPackage";

export function PackageCard({
  data,
  onEdit,
}: {
  data: IPackage;
  onEdit: (packageItem: IPackage) => void;
}) {
  const client = useQueryClient();
  const {notify} = useNotification();
  const [isDeleting, setIsDeleting] = useState(false);
  const imageUrl = data.imageURL?.[0] || "/assets/images/landing-page/suit.jpg";
  const modeLabel =
    data.mode === "rental"
      ? "Rental"
      : data.mode === "purchase"
        ? "Purchase"
        : "Rental + purchase";

  const deleteMutation = useMutation({
    mutationFn: deletePackageService,
    onSuccess: () => {
      client.invalidateQueries({queryKey: ["packages"]});
      notify({
        title: "Package deleted",
        description: "The package has been removed from inventory.",
        variant: "success",
      });
    },
  });

  const handleDelete = async () => {
    if (!data._id) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(data._id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="group relative h-full min-h-52 min-w-0 overflow-hidden border-0 py-0 shadow-sm ring-1 ring-border/60 transition-all duration-200 hover:shadow-md hover:ring-border">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Actions for ${data.name}`}
            className="absolute right-3 top-3 z-10 h-9 w-9 rounded-lg bg-background/90 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36 rounded-lg p-1">
          <DropdownMenuItem
            onClick={() => onEdit(data)}
            className="flex cursor-pointer items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <AlertDialogComponent
            action={handleDelete}
            isLoading={isDeleting}
            title="Delete this package?"
            description="This will permanently remove the package from inventory."
            actionLabel="Delete"
          >
            <DropdownMenuItem
              onSelect={(event) => event.preventDefault()}
              className="flex cursor-pointer items-center gap-2 text-red-500 focus:text-red-500"
              disabled={isDeleting}
            >
              <Trash className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </AlertDialogComponent>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex h-full flex-col sm:flex-row">
        <div className="relative h-48 shrink-0 overflow-hidden sm:h-auto sm:w-44 sm:self-stretch">
          <Image
            src={imageUrl}
            sizes="(max-width: 640px) 100vw, 176px"
            alt={data.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute bottom-2 left-2">
            <Badge
              variant="outline"
              className="gap-1 rounded-md text-[11px] shadow-sm"
            >
              <PackageCheck className="size-3" />
              {data.items?.length ?? 0} outfits
            </Badge>
          </div>
        </div>

        <CardContent className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
          <div className="min-w-0 space-y-2 pr-10">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="min-w-0 max-w-full break-words text-base leading-snug">
                {data.name}
              </CardTitle>
              <Badge
                variant="default"
                className="max-w-full truncate rounded-full text-xs font-medium"
              >
                {modeLabel}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2 break-words text-sm leading-relaxed">
              {data.items?.length
                ? `${data.items.length} outfits included in this package.`
                : "No outfits in this package."}
            </CardDescription>
          </div>

          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              {data.purchaseTotal != null && data.purchaseTotal > 0 && (
                <div className="flex min-w-0 items-baseline gap-1.5">
                  <span className="w-9 text-[10px] uppercase tracking-wide text-muted-foreground/60">
                    Buy
                  </span>
                  <PhilippinePeso className="size-3 self-center text-muted-foreground" />
                  <span className="min-w-0 break-words text-lg font-medium tabular-nums text-foreground">
                    {data.purchaseTotal.toLocaleString()}
                  </span>
                </div>
              )}
              {data.purchaseTotal != null &&
                data.purchaseTotal > 0 &&
                data.rentalTotal != null &&
                data.rentalTotal > 0 && (
                  <div className="h-px w-full bg-border/40" />
                )}
              {data.rentalTotal != null && data.rentalTotal > 0 && (
                <div className="flex min-w-0 items-baseline gap-1.5">
                  <span className="w-9 text-[10px] uppercase tracking-wide text-muted-foreground/60">
                    Rent
                  </span>
                  <PhilippinePeso className="size-3 self-center text-muted-foreground/60" />
                  <span className="min-w-0 break-words text-sm tabular-nums text-muted-foreground">
                    {data.rentalTotal.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
