import {useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {Pencil, Trash} from "lucide-react";
import {AlertDialogComponent} from "@/components/AlertDialog";
import {useNotification} from "@/components/ui/alert";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu";
import {deleteOutfitByIdService} from "../services/outfitService";
import {useOutfit} from "../hooks/useOutfit";
import Image from "next/image";
import {TableCell, TableRow} from "@/components/ui/table";
import {formatCurrency} from "@/lib/formatters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {Badge} from "@/components/ui/badge";
import {IOutfit} from "../types/IOutfit";
import {getColorValue} from "../constants/constants";
import {CardDropdownMenu} from "./CardDropdownMenu";
import {OutfitBranchBadge} from "@/features/reusable/OutfitBranchBadge";

export default function InventoryOutfitRow({data}: {data: IOutfit}) {
  const client = useQueryClient();
  const {setModalOpen, setIsEdit, setOutfit} = useOutfit();
  const {notify} = useNotification();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteOutfitMutation = useMutation({
    mutationFn: deleteOutfitByIdService,
    onSuccess: () => {
      client.invalidateQueries({queryKey: ["outfits"]});
    },
  });

  const handleOutfitDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      await deleteOutfitMutation.mutateAsync(data._id!);
      notify({
        title: "Outfit deleted",
        description: "The outfit was removed from inventory.",
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      notify({
        title: "Delete failed",
        description: "Unable to delete outfit. Please try again.",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditOutfit = () => {
    setIsEdit(true);
    setOutfit(data);
    setModalOpen(true);
  };

  const totalStock =
    data.variants?.reduce(
      (sum, v) => sum + (v.sizes ?? []).reduce((s, sz) => s + (sz.stock ?? 0), 0),
      0,
    ) ?? 0;
  const isLowStock = totalStock > 0 && totalStock <= 5;
  const stockLabel =
    totalStock === 0
      ? "Out of stock"
      : isLowStock
        ? `Low stock: ${totalStock}`
        : `${totalStock} in stock`;
  // Solid fills so the badge stays legible over any photo: destructive when
  // out, gold accent when low, secondary (navy) when healthy.
  const stockBadgeClass =
    totalStock === 0
      ? "border-0 bg-destructive text-white"
      : isLowStock
        ? "border-0 bg-accent text-accent-foreground"
        : "border-0 bg-secondary text-secondary-foreground";
  const hasArModel =
    typeof data.modelURL === "string" && Boolean(data.modelURL);

  return (
    <TableRow className="text-secondary">
      <TableCell>
        <div className="flex min-w-52 items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted/30">
            <Image
              src={typeof data.imageURL === "string" && data.imageURL ? data.imageURL : "/assets/images/landing-page/suit.jpg"}
              alt=""
              fill
              sizes="48px"
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-primary">{data.name}</p>
            {data.description && <p className="line-clamp-2 max-w-64 text-xs text-secondary">{data.description}</p>}
          </div>
          {hasArModel && <Badge variant="secondary">With AR</Badge>}
        </div>
      </TableCell>
      <TableCell>{data.category || "—"}</TableCell>
      <TableCell><OutfitBranchBadge branch={data.branch} /></TableCell>
      <TableCell className="min-w-28">
        <TooltipProvider delayDuration={100}>
          <div className="flex max-w-full flex-wrap items-center gap-2">
            {data.variants.map((variant, index) => {
              const maxStock = Math.max(
                ...variant.sizes.map((s) => s.stock),
                1,
              );
              const colorValue = getColorValue(variant.color);
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <span
                      className="size-5 shrink-0 cursor-default rounded-full border border-foreground/30 transition-transform hover:scale-125"
                      style={{
                        backgroundColor: colorValue,
                        boxShadow:
                          "inset 0 0 0 1px rgba(0,0,0,0.12)",
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="min-w-[130px] rounded-lg border-0 bg-popover p-0 text-popover-foreground shadow-lg"
                    sideOffset={8}
                  >
                    <div className="space-y-2.5 p-3">
                      {/* Color header */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className="size-2.5 shrink-0 rounded-full border border-foreground/30"
                          style={{
                            backgroundColor: colorValue,
                            boxShadow:
                              "inset 0 0 0 1px rgba(0,0,0,0.12)",
                          }}
                        />
                        <span className="text-xs font-medium text-foreground capitalize">
                          {variant.color}
                        </span>
                      </div>
                      {/* Size + stock rows */}
                      <div className="flex min-w-0 flex-col gap-1">
                        {variant.sizes.map((s) => (
                          <div
                            key={s.size}
                            className="flex items-center gap-2.5"
                          >
                            <span
                              className={`w-6 text-xs font-medium ${
                                s.stock === 0
                                  ? "text-muted-foreground/40 line-through"
                                  : "text-foreground"
                              }`}
                            >
                              {s.size}
                            </span>
                            <div className="h-1 w-8 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-accent"
                                style={{
                                  width: `${(s.stock / maxStock) * 100}%`,
                                }}
                              />
                            </div>
                            <span
                              className={`min-w-[1.25rem] text-right text-[11px] tabular-nums ${
                                s.stock === 0
                                  ? "text-muted-foreground/30"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {s.stock}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </TableCell>
      <TableCell><Badge className={stockBadgeClass}>{stockLabel}</Badge></TableCell>
      <TableCell className="text-right tabular-nums">{data.price ? formatCurrency(data.price) : "—"}</TableCell>
      <TableCell className="text-right tabular-nums">{data.rentalPrice ? formatCurrency(data.rentalPrice) : "—"}</TableCell>
      <TableCell className="text-right">
        <CardDropdownMenu label={`Actions for ${data.name}`}>
          <DropdownMenuItem
            onClick={handleEditOutfit}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownMenuItem>

          <AlertDialogComponent action={handleOutfitDelete} isLoading={isDeleting}>
            <DropdownMenuItem
              onSelect={(event) => event.preventDefault()}
              className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer"
              disabled={isDeleting}
            >
              <Trash className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </AlertDialogComponent>
        </CardDropdownMenu>
      </TableCell>
    </TableRow>
  );
}
