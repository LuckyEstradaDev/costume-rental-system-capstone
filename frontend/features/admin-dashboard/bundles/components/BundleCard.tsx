"use client";

import {useState} from "react";
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
import {deleteBundleService} from "../services/BundleService";
import type {IBundle} from "../types/IBundle";

export function BundleCard({
  data,
  onEdit,
}: {
  data: IBundle;
  onEdit: (bundle: IBundle) => void;
}) {
  const client = useQueryClient();
  const {notify} = useNotification();
  const [isDeleting, setIsDeleting] = useState(false);
  const imageUrl = data.imageURL?.[0] || "/assets/images/landing-page/suit.jpg";

  const deleteMutation = useMutation({
    mutationFn: deleteBundleService,
    onSuccess: () => {
      client.invalidateQueries({queryKey: ["bundles"]});
      notify({
        title: "Bundle deleted",
        description: "The bundle has been removed from inventory.",
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
    <Card className="group relative overflow-hidden border-0 py-0 shadow-sm ring-1 ring-border/60 transition-all duration-200 hover:shadow-md hover:ring-border">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Actions for ${data.name}`}
            className="absolute right-3 top-3 z-10 h-9 w-9 rounded-full bg-white text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36 rounded-xl p-1">
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
            title="Delete this bundle?"
            description="This will permanently remove the bundle from inventory."
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

      <div className="flex flex-col sm:flex-row">
        <div className="relative h-48 shrink-0 overflow-hidden sm:h-auto sm:w-44 sm:self-stretch">
          <img
            src={imageUrl}
            alt={data.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute bottom-2 left-2">
            <Badge className="gap-1 text-[11px] shadow-sm">
              <PackageCheck className="size-3" />
              {data.items?.length ?? 0} outfits
            </Badge>
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
          <div className="space-y-2 pr-10">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base leading-snug">
                {data.name}
              </CardTitle>
              <Badge
                variant="secondary"
                className="rounded-full text-xs font-medium"
              >
                Bundle
              </Badge>
            </div>
            <CardDescription className="line-clamp-2 text-sm leading-relaxed">
              {data.items?.length
                ? data.items.map((item) => item.name).join(", ")
                : "No outfits in this bundle."}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
            {data.price > 0 && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60">
                  Buy
                </span>
                <PhilippinePeso className="size-3 text-muted-foreground" />
                <span className="text-lg font-medium tabular-nums">
                  {data.price.toLocaleString()}
                </span>
              </div>
            )}
            {data.rentalPrice > 0 && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60">
                  Rent
                </span>
                <PhilippinePeso className="size-3 text-muted-foreground" />
                <span className="text-sm tabular-nums text-muted-foreground">
                  {data.rentalPrice.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
