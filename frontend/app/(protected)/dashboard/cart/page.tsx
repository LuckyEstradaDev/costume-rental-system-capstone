"use client";

import {useAuth} from "@/features/auth/hooks/useAuth";
import {CartEmpty} from "@/features/user-dashboard/cart/components/CartEmpty";
import {CartList} from "@/features/user-dashboard/cart/components/CartList";
import {CartSummary} from "@/features/user-dashboard/cart/components/CartSummary";
import {
  CartTabs,
  type CartTab,
} from "@/features/user-dashboard/cart/components/CartTabs";
import {fetchCartItemsService} from "@/features/user-dashboard/cart/services/cartService";
import {getCartItemKey} from "@/features/user-dashboard/cart/utils";
import {useMemo, useState} from "react";
import {ICartItem} from "@/features/user-dashboard/cart/types/ICart";
import type {CheckoutMode} from "@/features/user-dashboard/cart/types/checkout";
import type {CartEntry} from "@/features/user-dashboard/cart/types/CartEntry";
import {fetchOutfitById} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {useQueries, useQuery, useQueryClient} from "@tanstack/react-query";
import {sortArrayByLatestDate} from "@/lib/helper";
import {fetchPackageCartService} from "@/features/user-dashboard/package/services/packageCartService";
import {usePackages} from "@/features/admin-dashboard/packages/hooks/usePackages";

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
  const packageItems = useMemo(
    () => queriedPackageData?.packageItems ?? [],
    [queriedPackageData],
  );
  const outfitIds = [
    ...new Set([
      ...items.map((item) => item.outfitId),
      ...packageItems.flatMap((pkg) =>
        pkg.items.map((item) => item.outfitId),
      ),
    ]),
  ].filter(Boolean);

  const outfitQueries = useQueries({
    queries: outfitIds.map((outfitId) => ({
      queryKey: ["outfit", outfitId],
      queryFn: () => fetchOutfitById(outfitId),
    })),
  });

  const outfitsById = Object.fromEntries(
    outfitIds.map((outfitId, index) => [
      outfitId,
      outfitQueries[index]?.data,
    ]),
  );

  const {data: packages = []} = usePackages();
  const packageReferencesById = Object.fromEntries(
    packages.map((pkg) => [pkg._id, pkg.referenceID]),
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
      const outfit = outfitsById[item.outfitId];

      return {
        ...item,
        outfitReferenceID:
          item.outfitReferenceID ?? outfit?.referenceID ?? undefined,
        price: Number(outfit?.price ?? item.price) || item.price,
        rentalPrice:
          outfit?.rentalPrice !== undefined
            ? Number(outfit.rentalPrice)
            : item.rentalPrice,
      };
    });
  }, [queriedCartData, outfitsById]);

  const enrichedPackageItems = useMemo(
    () =>
      packageItems.map((pkg) => ({
        ...pkg,
        packageReferenceID:
          pkg.packageReferenceID ??
          packageReferencesById[pkg.packageId] ??
          undefined,
        items: pkg.items.map((item) => ({
          ...item,
          outfitReferenceID:
            item.outfitReferenceID ??
            outfitsById[item.outfitId]?.referenceID ??
            undefined,
        })),
      })),
    [packageItems, packageReferencesById, outfitsById],
  );

  /**
   * Combined timeline of single outfits + packages (newest first). The cart is
   * rendered as two tabs over this list (outfits and packages), so users can
   * never select from both at the same time.
   */
  const cartEntries = useMemo<CartEntry[]>(() => {
    const entries: CartEntry[] = [];
    for (const item of cartItems) {
      entries.push({kind: "outfit", item});
    }
    for (const pkg of enrichedPackageItems) {
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
  }, [cartItems, enrichedPackageItems]);

  const outfitCartEntries = useMemo(
    () => cartEntries.filter((entry) => entry.kind === "outfit"),
    [cartEntries],
  );
  const packageCartEntries = useMemo(
    () => cartEntries.filter((entry) => entry.kind === "package"),
    [cartEntries],
  );

  const selectedItems = useMemo(() => {
    if (activeTab === "outfits") {
      return cartItems?.filter((item, index) =>
        selectedKeys.includes(getCartItemKey(item, index)),
      );
    } else {
      return enrichedPackageItems?.filter((item) =>
        selectedPackageKeys.includes(item.packageId),
      );
    }
  }, [
    activeTab,
    cartItems,
    selectedKeys,
    enrichedPackageItems,
    selectedPackageKeys,
  ]);

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
   * outfit can never remain selected at the same time. Whatever was picked
   * on the tab you leave is discarded.
   */
  const handleTabChange = (tab: CartTab) => {
    if (tab === activeTab) return;
    setSelectedKeys([]);
    setSelectedPackageKeys([]);
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            My Cart
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Review and manage your chosen items before checkout.
          </p>
        </div>
      </div>

      {cartEntries.length === 0 ? (
        <CartEmpty />
      ) : (
        <div className="space-y-5 pb-28 lg:pb-0">
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
                activeTab={activeTab}
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
