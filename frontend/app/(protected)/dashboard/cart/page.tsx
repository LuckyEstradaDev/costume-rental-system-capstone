"use client";

import {useAuth} from "@/features/auth/hooks/useAuth";
import {CartEmpty} from "@/features/user-dashboard/cart/components/CartEmpty";
import {CartList} from "@/features/user-dashboard/cart/components/CartList";
import {CartSummary} from "@/features/user-dashboard/cart/components/CartSummary";
import {CartTabs, type CartTab} from "@/features/user-dashboard/cart/components/CartTabs";
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
import {fetchPackageCartService} from "@/features/user-dashboard/package/services/packageCartService";

/**
 * Dev fallback for the package rows in the merged cart list. Rendered ONLY when
 * the backend has no package cart for the user at all (`queriedPackageData` is
 * null/undefined) so the list still has something to show before a real
 * package cart exists. Real package data always takes precedence.
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
        name: "Phantom Masquerade Suit",
        category: "Suit",
        imageURL: "/assets/images/landing-page/suit.jpg",
      },
      {
        _id: "outfit-2",
        variantId: "var-2",
        size: "L",
        quantity: 1,
        purchasePrice: 1500,
        rentalPrice: 420,
        name: "Gothic Masquerade Gown",
        category: "Gown",
        imageURL: "/assets/images/landing-page/gown.jpg",
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
        name: "Enchanted Fairy Gown",
        category: "Gown",
        imageURL: "/assets/images/landing-page/hero-gown.png",
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
  const [activeTab, setActiveTab] = useState<CartTab>("outfits");
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>("rent");
  const {user} = useAuth();

  const {data: queriedCartData} = useQuery({
    queryKey: ["cart", user?._id],
    queryFn: () => fetchCartItemsService(user!._id!),
    enabled: Boolean(user?._id),
  });

  const {data: queriedPackageData} = useQuery({
    queryKey: ["package"],
    queryFn: () => {
      if (!user?._id) {
        throw new Error("User ID is required");
      }

      return fetchPackageCartService(user._id);
    },
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

  const packageItems = useMemo(
    () => queriedPackageData?.packageItems ?? SAMPLE_PACKAGES,
    [queriedPackageData],
  );

  /**
   * Combined timeline of single outfits + packages (newest first). The cart is
   * rendered as two tabs over this list — outfits and packages — so users can
   * never select from both at the same time.
   */
  const cartEntries = useMemo<CartEntry[]>(() => {
    const entries: CartEntry[] = [];
    for (const item of cartItems) {
      entries.push({kind: "outfit", item});
    }
    for (const pkg of packageItems) {
      entries.push({kind: "package", pkg});
    }

    const toTime = (value?: string | Date | null) =>
      value ? new Date(value).getTime() : 0;

    return entries.sort((a, b) => {
      const dateA =
        a.kind === "outfit"
          ? toTime(a.item.createdAt)
          : toTime(a.pkg.createdAt);
      const dateB =
        b.kind === "outfit"
          ? toTime(b.item.createdAt)
          : toTime(b.pkg.createdAt);
      return dateB - dateA;
    });
  }, [cartItems, packageItems]);

  const outfitCartEntries = useMemo(
    () => cartEntries.filter((entry) => entry.kind === "outfit"),
    [cartEntries],
  );
  const packageCartEntries = useMemo(
    () => cartEntries.filter((entry) => entry.kind === "package"),
    [cartEntries],
  );

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

  /**
   * Switching tabs clears BOTH selection states, so a package and a single
   * outfit can never remain selected at the same time — whatever was picked
   * on the tab you leave is discarded.
   */
  const handleTabChange = (tab: CartTab) => {
    if (tab === activeTab) return;
    setSelectedKeys([]);
    setSelectedPackageKeys([]);
    setActiveTab(tab);
  };

  const activeCount =
    activeTab === "outfits"
      ? outfitCartEntries.length
      : packageCartEntries.length;
  const activeLabel =
    activeTab === "outfits"
      ? activeCount === 1
        ? "outfit"
        : "outfits"
      : activeCount === 1
        ? "package"
        : "packages";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
            <ShoppingCart className="size-6 text-foreground" />
            My Cart
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {activeCount} {activeLabel} — review and manage before checkout
          </p>
        </div>
      </div>

      {cartEntries.length === 0 ? (
        <CartEmpty />
      ) : (
        <div className="space-y-5">
          <CartTabs
            activeTab={activeTab}
            outfitCount={outfitCartEntries.length}
            packageCount={packageCartEntries.length}
            onTabChange={handleTabChange}
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CartList
                entries={
                  activeTab === "outfits"
                    ? outfitCartEntries
                    : packageCartEntries
                }
                emptyLabel={
                  activeTab === "outfits"
                    ? "No outfits in cart yet"
                    : "No packages in cart yet"
                }
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
        </div>
      )}
    </div>
  );
}
