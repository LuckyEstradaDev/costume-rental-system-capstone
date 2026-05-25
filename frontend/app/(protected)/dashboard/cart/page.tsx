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

export default function CartPage() {
  const [cartData, setCartData] = useState<ICartItem | null>(null);
  const [cartLength, setCartLength] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const {user} = useAuth();

  useEffect(() => {
    const getUserCarts = async () => {
      try {
        const {data} = await fetchCartItemsService(user?._id || "");
        console.log("Cart data:", data);
        setCartData(data);
        setCartLength(data?.items?.length || 0);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setCartLength(0);
      }
    };

    if (user?._id) {
      getUserCarts();
    }
  }, [user]);

  const selectedItems = useMemo(() => {
    const items = cartData?.items || [];

    return items.filter((item, index) =>
      selectedKeys.includes(getCartItemKey(item, index)),
    );
  }, [cartData, selectedKeys]);

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
              items={cartData?.items || []}
              selectedKeys={selectedKeys}
              onToggleItem={handleToggleItem}
            />
          </div>
          <div>
            <CartSummary items={selectedItems} />
          </div>
        </div>
      )}
    </div>
  );
}
