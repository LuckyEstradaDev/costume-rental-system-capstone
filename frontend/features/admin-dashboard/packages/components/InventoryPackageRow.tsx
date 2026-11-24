"use client";

import {useState} from "react";
import Image from "next/image";
import {MoreHorizontal, Pencil, Trash} from "lucide-react";
import {AlertDialogComponent} from "@/components/AlertDialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {TableCell, TableRow} from "@/components/ui/table";
import {formatCurrency} from "@/lib/formatters";
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

export function InventoryPackageRow({
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
    onError: () => {
      notify({
        title: "Delete failed",
        description: "Unable to delete package. Please try again.",
        variant: "error",
      });
    },
  });

  const handleDelete = async () => {
    if (!data._id) return;
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(data._id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TableRow className="text-secondary">
      <TableCell>
        <div className="flex min-w-52 items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted/30">
            <Image src={imageUrl} alt="" fill sizes="48px" className="object-contain" />
          </div>
          <span className="font-semibold text-primary">{data.name}</span>
        </div>
      </TableCell>
      <TableCell><Badge variant="secondary">{modeLabel}</Badge></TableCell>
      <TableCell className="tabular-nums">{data.items?.length ?? 0}</TableCell>
      <TableCell className="text-right tabular-nums">{data.purchaseTotal != null && data.purchaseTotal > 0 ? formatCurrency(data.purchaseTotal) : "—"}</TableCell>
      <TableCell className="text-right tabular-nums">{data.rentalTotal != null && data.rentalTotal > 0 ? formatCurrency(data.rentalTotal) : "—"}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Actions for ${data.name}`}
              className="size-9 text-muted-foreground hover:bg-muted hover:text-foreground"
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
      </TableCell>
    </TableRow>
  );
}
