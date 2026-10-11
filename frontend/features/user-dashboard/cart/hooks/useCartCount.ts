"use client";

import {useQuery} from "@tanstack/react-query";

import {useAuth} from "@/features/auth/hooks/useAuth";
import {fetchPackageCartService} from "@/features/user-dashboard/package/services/packageCartService";
import {fetchCartItemsService} from "@/features/user-dashboard/cart/services/cartService";

/**
 * Total number of garments in the signed-in user's cart, across both the
 * single-outfit cart and the package cart.
 *
 * Reuses the same query keys the cart page uses (`["cart", userId]` and
 * `["package"]`) so the header reads the already-cached data instead of firing
 * its own requests, and stays in sync when either cart is invalidated.
 */
export function useCartCount() {
  const {user} = useAuth();

  const {data: cart} = useQuery({
    queryKey: ["cart", user?._id],
    queryFn: () => fetchCartItemsService(user!._id!),
    enabled: Boolean(user?._id),
  });

  const {data: packageCart} = useQuery({
    queryKey: ["package"],
    queryFn: () => fetchPackageCartService(user!._id!),
    enabled: Boolean(user?._id),
  });

  const outfitCount =
    cart?.items.reduce((total, item) => total + (item.quantity || 0), 0) ?? 0;

  const packageCount =
    packageCart?.packageItems.reduce(
      (total, pkg) =>
        total +
        pkg.items.reduce((pkgTotal, item) => pkgTotal + (item.quantity || 0), 0),
      0,
    ) ?? 0;

  return outfitCount + packageCount;
}
