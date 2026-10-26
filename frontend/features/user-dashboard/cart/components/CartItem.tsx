"use client";

import Image from "next/image";
import Link from "next/link";
import type React from "react";
import {useEffect, useState} from "react";
import {CalendarClock, CreditCard, Minus, Plus, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {AlertDialogComponent} from "@/components/AlertDialog";
import {fetchOutfitById} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import type {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {buildOutfitPath} from "@/lib/reference-path";
import {ICartItem} from "../types/ICart";
import {Checkbox} from "@/components/ui/checkbox";
import {removeFromCartService} from "../services/cartService";
import {useAuth} from "@/features/auth/hooks/useAuth";
import type {CheckoutMode} from "../types/checkout";
import {useNotification} from "@/components/ui/alert";
import {useMutation, useQueryClient} from "@tanstack/react-query";

type CartItemProps = {
  item: ICartItem["items"][number];
  checked: boolean;
  checkoutMode: CheckoutMode;
  onQuantityChange: (outfitId: string, change: number) => void;
  onCheckedChange: (checked: boolean) => void;
};

export function CartItem({
  item,
  checked,
  checkoutMode,
  onQuantityChange,
  onCheckedChange,
}: CartItemProps) {
  const {user} = useAuth();
  const client = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [outfitPrices, setOutfitPrices] = useState<
    Pick<IOutfit, "price" | "rentalPrice">
  >({});
  const {notify} = useNotification();

  useEffect(() => {
    let isActive = true;

    const loadOutfitPrices = async () => {
      if (!item.outfitId || item.rentalPrice) {
        return;
      }

      try {
        const data = await fetchOutfitById(item.outfitId);

        if (isActive) {
          setOutfitPrices({
            price: data?.price,
            rentalPrice: data?.rentalPrice,
          });
        }
      } catch (error) {
        console.error("Error loading cart item prices:", error);
      }
    };

    void loadOutfitPrices();

    return () => {
      isActive = false;
    };
  }, [item.outfitId, item.rentalPrice]);

  const deleteCartItemMutation = useMutation({
    mutationFn: removeFromCartService,
    onSuccess: () => {
      client.invalidateQueries({queryKey: ["cart"]});
      notify({
        title: "Item removed.",
        description: "Item removed successfully.",
        variant: "success",
      });
    },
  });

  const price = outfitPrices.price ?? item.price;
  const rentalPrice = item.rentalPrice ?? outfitPrices.rentalPrice;
  const isRentalUnavailable =
    checkoutMode === "rent" && !(Number(rentalPrice) > 0);

  const outfitHref =
    buildOutfitPath(item.outfitReferenceID) ||
    buildOutfitPath(item.outfitId) ||
    "/dashboard/browse";

  const handleRemoveItem = async () => {
    setIsDeleting(true);
    try {
      await deleteCartItemMutation.mutateAsync({
        userId: user!._id!,
        variantId: item.variantId,
        size: item.size,
      });
    } catch (error) {
      console.error("Error removing item from cart:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`group flex items-center gap-3 rounded-lg border p-3 transition-colors sm:gap-4 sm:p-4 ${checked ? "border-primary bg-primary/5" : "border-border bg-background hover:border-border/80 hover:bg-muted/40"}`}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mr-1 size-5 shrink-0 rounded-md border-2 border-muted-foreground/50 bg-background transition-colors hover:border-primary sm:mr-2"
      />
      <Link
        href={outfitHref}
        title={`View ${item.name || "outfit"}`}
        className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/50 sm:h-24 sm:w-24"
      >
        <Image
          src={item.imageURL || "/assets/images/landing-page/suit.jpg"}
          alt={item.name || "Product"}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold">
          <Link
            href={outfitHref}
            className="transition-colors hover:text-primary hover:underline"
          >
            {item.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{item.category}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span>Size: {item.size}</span>
          <span>Color: {item.color}</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold sm:gap-x-4 sm:text-sm">
          {Number(rentalPrice) > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-primary">
              <CalendarClock className="size-3.5" />
              ₱{Number(rentalPrice)}
            </span>
          ) : isRentalUnavailable ? (
            <span className="inline-flex items-center gap-1.5 text-destructive">
              <CalendarClock className="size-3.5" />
              Rental unavailable
            </span>
          ) : null}
          {Number(price) > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-primary">
              <CreditCard className="size-3.5" />
              ₱{Number(price)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-md border border-input p-1">
          <Button
            variant="ghost"
            size="sm"
            className="size-7 rounded p-0 hover:bg-muted"
            onClick={() => onQuantityChange(item.outfitId, -1)}
          >
            <Minus className="size-3.5" />
          </Button>
          <span className="w-7 text-center text-sm font-semibold">
            {item.quantity || 1}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="size-7 rounded p-0 hover:bg-muted"
            onClick={() => onQuantityChange(item.outfitId, 1)}
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
        <AlertDialogComponent
          action={handleRemoveItem}
          isLoading={isDeleting}
          title={`Remove ${item.name || "this item"} from cart?`}
          description="This will delete the item from your cart and refresh the list."
          actionLabel="Remove item"
        >
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 size-8 rounded-md p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </AlertDialogComponent>
      </div>
    </div>
  );
}