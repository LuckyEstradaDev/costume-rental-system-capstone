"use client";

import {useAuth} from "@/features/auth/hooks/useAuth";
import {CartEmpty} from "@/features/user-dashboard/cart/components/CartEmpty";
import {CartList} from "@/features/user-dashboard/cart/components/CartList";
import {CartSummary} from "@/features/user-dashboard/cart/components/CartSummary";
import {fetchCartItemsService} from "@/features/user-dashboard/cart/services/cartService";
import {getCartItemKey} from "@/features/user-dashboard/cart/utils";
import {useEffect, useMemo, useState} from "react";
import {ICartItem} from "@/features/user-dashboard/cart/types/ICart";
import {ShoppingCart} from "lucide-react";
import type {CheckoutMode} from "@/features/user-dashboard/cart/types/checkout";
import {fetchOutfitById} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import type {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";

export default function CartPage() {
  const [cartData, setCartData] = useState<ICartItem | null>(null);
  const [cartLength, setCartLength] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>("rent");
  const [outfitPricesById, setOutfitPricesById] = useState<
    Record<string, Pick<IOutfit, "price" | "rentalPrice">>
  >({});
  const {user} = useAuth();

  const refreshCart = async (userId: string) => {
    try {
      const {data} = await fetchCartItemsService(userId);
      setCartData(data);
      setCartLength(data?.items?.length || 0);
      setSelectedKeys([]);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartLength(0);
      setCartData(null);
      setSelectedKeys([]);
    }
  };

  useEffect(() => {
    const userId = user?._id;

    if (userId) {
      const loadCart = async () => {
        await refreshCart(userId);
      };

      void loadCart();
    }
  }, [user?._id]);

  useEffect(() => {
    let isActive = true;
    const items = cartData?.items || [];
    const missingPriceOutfitIds = [
      ...new Set(
        items
          .filter((item) => item.outfitId && !item.rentalPrice)
          .map((item) => item.outfitId),
      ),
    ];

    const loadMissingPrices = async () => {
      if (missingPriceOutfitIds.length === 0) {
        setOutfitPricesById({});
        return;
      }

      const entries = await Promise.all(
        missingPriceOutfitIds.map(async (outfitId) => {
          try {
            const {data} = await fetchOutfitById(outfitId);
            return [
              outfitId,
              {price: data?.price, rentalPrice: data?.rentalPrice},
            ] as const;
          } catch {
            return [outfitId, {}] as const;
          }
        }),
      );

      if (isActive) {
        setOutfitPricesById(Object.fromEntries(entries));
      }
    };

    void loadMissingPrices();

    return () => {
      isActive = false;
    };
  }, [cartData]);

  const cartItems = useMemo(() => {
    return (cartData?.items || []).map((item) => {
      const outfitPrices = outfitPricesById[item.outfitId];

      return {
        ...item,
        price: Number(outfitPrices?.price ?? item.price) || item.price,
        rentalPrice:
          outfitPrices?.rentalPrice !== undefined
            ? Number(outfitPrices.rentalPrice)
            : item.rentalPrice,
      };
    });
  }, [cartData, outfitPricesById]);

  const selectedItems = useMemo(() => {
    return cartItems.filter((item, index) =>
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

      {cartLength === 0 ? (
        <CartEmpty />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CartList
              items={cartItems}
              setCartData={setCartData}
              refreshCart={() => refreshCart(user!._id!)}
              selectedKeys={selectedKeys}
              checkoutMode={checkoutMode}
              onToggleItem={handleToggleItem}
            />
          </div>
          <div>
            <CartSummary
              items={selectedItems}
              checkoutMode={checkoutMode}
              onCheckoutModeChange={setCheckoutMode}
            />
          </div>
        </div>
      )}
    </div>
  );
}
