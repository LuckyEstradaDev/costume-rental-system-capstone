"use client";

import {useQuery} from "@tanstack/react-query";

import {useAuth} from "@/features/auth/hooks/useAuth";
import {fetchPackageCartService} from "@/features/user-dashboard/package/services/packageCartService";
import {fetchCartItemsService} from "@/features/user-dashboard/cart/services/cartService";

/**
 * Number of cart entries in the signed-in user's cart, across both the
 * single-outfit cart and the package cart. Each standalone outfit counts as 1
 * and each package counts as 1, regardless of how many outfits, selection
 * lines or units it contains; per-line quantities are ignored (a line with
 * quantity 50 still counts once).
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

  const outfitCount = cart?.items.length ?? 0;

  const packageCount = packageCart?.packageItems.length ?? 0;

  return outfitCount + packageCount;
}
