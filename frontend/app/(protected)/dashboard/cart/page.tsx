"use client";

import {useAuth} from "@/features/auth/hooks/useAuth";
import {CartEmpty} from "@/features/user-dashboard/cart/components/CartEmpty";
import {CartList} from "@/features/user-dashboard/cart/components/CartList";
import {CartSummary} from "@/features/user-dashboard/cart/components/CartSummary";
import {fetchCartItemsService} from "@/features/user-dashboard/cart/services/cartService";
import {useEffect, useState} from "react";
import {ICartItem} from "@/features/user-dashboard/cart/types/ICart";

export default function CartPage() {
  const [cartData, setCartData] = useState<ICartItem | null>(null);
  const [cartLength, setCartLength] = useState(0);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Cart</h1>
        <p className="mt-1 text-muted-foreground">Manage your rental items</p>
      </div>

      {cartLength === 0 ? (
        <CartEmpty />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CartList items={cartData?.items || []} />
          </div>
          <div>
            <CartSummary items={cartData?.items || []} />
          </div>
        </div>
      )}
    </div>
  );
}
