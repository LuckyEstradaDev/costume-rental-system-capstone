"use client";

import {useAuth} from "@/features/auth/hooks/useAuth";
import {CartEmpty} from "@/features/user-dashboard/cart/components/CartEmpty";
import {CartList} from "@/features/user-dashboard/cart/components/CartList";
import {CartSummary} from "@/features/user-dashboard/cart/components/CartSummary";
import {fetchCartItemsService} from "@/features/user-dashboard/cart/services/cartService";
import {getCartItemKey} from "@/features/user-dashboard/cart/utils";
import {useMemo, useState} from "react";
import {ICartItem} from "@/features/user-dashboard/cart/types/ICart";
import {ShoppingCart} from "lucide-react";
import type {CheckoutMode} from "@/features/user-dashboard/cart/types/checkout";
import {fetchOutfitById} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {useQueries, useQuery, useQueryClient} from "@tanstack/react-query";
import {sortArrayByLatestDate} from "@/lib/helper";

export default function CartPage() {
  const client = useQueryClient();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>("rent");
  const {user} = useAuth();

  const {data: queriedCartData} = useQuery({
    queryKey: ["cart", user?._id],
    queryFn: () => fetchCartItemsService(user!._id!),
    enabled: Boolean(user?._id),
  });

  const items = queriedCartData?.items || [];
  const missingPriceOutfitIds = [
    ...new Set(
      items
        .filter((item) => item.outfitId && !item.rentalPrice)
        .map((item) => item.outfitId),
    ),
  ];

  const priceQueries = useQueries({
    queries: missingPriceOutfitIds.map((outfitId) => ({
      queryKey: ["outfit", outfitId],
      queryFn: () => fetchOutfitById(outfitId),
    })),
  });

  const queriedPrices = Object.fromEntries(
    missingPriceOutfitIds.map((outfitId, index) => {
      const outfit = priceQueries[index]?.data?.data;
      return [
        outfitId,
        {price: outfit?.price, rentalPrice: outfit?.rentalPrice},
      ];
    }),
  );

  const updateItemQuantity = (outfitId: string, change: number) => {
    client.setQueryData(["cart", user?._id], (old: ICartItem | undefined) => {
      if (!old) return old;
      return {
        ...old,
        items: old.items.map((cartItem) =>
          cartItem.outfitId === outfitId
            ? {...cartItem, quantity: Math.max(1, cartItem.quantity + change)}
            : cartItem,
        ),
      };
    });
  };

  const cartItems = useMemo(() => {
    if (!queriedCartData) return [];
    return (sortArrayByLatestDate(queriedCartData.items) || []).map((item) => {
      const outfitPrices = queriedPrices[item.outfitId];

      return {
        ...item,
        price: Number(outfitPrices?.price ?? item.price) || item.price,
        rentalPrice:
          outfitPrices?.rentalPrice !== undefined
            ? Number(outfitPrices.rentalPrice)
            : item.rentalPrice,
      };
    });
  }, [queriedCartData, queriedPrices]);

  const selectedItems = useMemo(() => {
    return cartItems?.filter((item, index) =>
      selectedKeys.includes(getCartItemKey(item, index)),
    );
  }, [cartItems, selectedKeys]);

  const handleToggleItem = (
    item: ICartItem["items"][number],
    index: number,
    checked: boolean,
  ) => {
    const itemKey = getCartItemKey(item, index);

    setSelectedKeys((previousKeys) => {
      if (checked) {
        return previousKeys.includes(itemKey)
          ? previousKeys
          : [...previousKeys, itemKey];
      }

      return previousKeys.filter((key) => key !== itemKey);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <ShoppingCart className="size-4.5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              My Cart
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your rental items
            </p>
          </div>
        </div>
      </div>

      {queriedCartData?.items.length === 0 ? (
        <CartEmpty />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CartList
              items={cartItems!}
              onQuantityChange={updateItemQuantity}
              selectedKeys={selectedKeys}
              checkoutMode={checkoutMode}
              onToggleItem={handleToggleItem}
            />
          </div>
          <div>
            <CartSummary
              items={selectedItems!}
              checkoutMode={checkoutMode}
              onCheckoutModeChange={setCheckoutMode}
            />
          </div>
        </div>
      )}
    </div>
  );
}
