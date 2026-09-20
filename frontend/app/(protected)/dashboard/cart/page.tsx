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
import type {CartEntry} from "@/features/user-dashboard/cart/types/CartEntry";
import type {IPackageSnapshot} from "@/features/user-dashboard/package/types/IPackageSnapshot";
import {fetchOutfitById} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {useQueries, useQuery, useQueryClient} from "@tanstack/react-query";
import {sortArrayByLatestDate} from "@/lib/helper";

/**
 * TODO(fetch): Replace SAMPLE_PACKAGES with data from
 * `fetchPackageCartService(user?._id!)`. These samples exist purely so the
 * package rows in the merged cart list have something to render.
 */
const SAMPLE_PACKAGES: IPackageSnapshot[] = [
  {
    packageId: "pkg-001",
    name: "Halloween Horror Bundle",
    imageURL: ["/assets/images/landing-page/suit.jpg"],
    mode: "both",
    items: [
      {
        _id: "outfit-1",
        variantId: "var-1",
        size: "M",
        quantity: 2,
        purchasePrice: 1200,
        rentalPrice: 350,
      },
      {
        _id: "outfit-2",
        variantId: "var-2",
        size: "L",
        quantity: 1,
        purchasePrice: 1500,
        rentalPrice: 420,
      },
    ],
    purchaseTotal: 3900,
    rentalTotal: 1120,
    createdAt: "2026-09-19T10:30:00.000Z",
  },
  {
    packageId: "pkg-002",
    name: "Fantasy Fairy Tale Set",
    imageURL: ["/assets/images/landing-page/suit.jpg"],
    mode: "rental",
    items: [
      {
        _id: "outfit-3",
        variantId: "var-3",
        size: "S",
        quantity: 3,
        purchasePrice: 900,
        rentalPrice: 280,
      },
    ],
    purchaseTotal: 2700,
    rentalTotal: 840,
    createdAt: "2026-09-18T15:00:00.000Z",
  },
];

export default function CartPage() {
  const client = useQueryClient();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedPackageKeys, setSelectedPackageKeys] = useState<string[]>([]);
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

  /**
   * Merged cart list: single outfits + packages in one list, ordered by date
   * (newest first) so it reads as one timeline.
   *
   * TODO(fetch): swap SAMPLE_PACKAGES for the fetched package cart data.
   */
  const cartEntries = useMemo<CartEntry[]>(() => {
    const entries: CartEntry[] = [];
    for (const item of cartItems) {
      entries.push({kind: "outfit", item});
    }
    for (const pkg of SAMPLE_PACKAGES) {
      entries.push({kind: "package", pkg});
    }

    const toTime = (value?: string | Date | null) =>
      value ? new Date(value).getTime() : 0;

    return entries.sort((a, b) => {
      const dateA =
        a.kind === "outfit" ? toTime(a.item.createdAt) : toTime(a.pkg.createdAt);
      const dateB =
        b.kind === "outfit" ? toTime(b.item.createdAt) : toTime(b.pkg.createdAt);
      return dateB - dateA;
    });
  }, [cartItems]);

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

  const handleTogglePackage = (packageId: string, checked: boolean) => {
    setSelectedPackageKeys((previousKeys) => {
      if (checked) {
        return previousKeys.includes(packageId)
          ? previousKeys
          : [...previousKeys, packageId];
      }

      return previousKeys.filter((key) => key !== packageId);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
            <ShoppingCart className="size-6 text-foreground" />
            My Cart
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {cartEntries.length} {cartEntries.length === 1 ? "item" : "items"} — review and manage your
            outfits and packages before checkout
          </p>
        </div>
      </div>

      {cartEntries.length === 0 ? (
        <CartEmpty />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CartList
              entries={cartEntries}
              onQuantityChange={updateItemQuantity}
              selectedKeys={selectedKeys}
              packageKeys={selectedPackageKeys}
              checkoutMode={checkoutMode}
              onToggleItem={handleToggleItem}
              onTogglePackage={handleTogglePackage}
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