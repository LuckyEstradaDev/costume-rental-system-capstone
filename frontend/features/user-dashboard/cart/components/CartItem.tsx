"use client";

import Image from "next/image";
import {Trash2, Minus, Plus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ICartItem} from "../types/ICart";
import {Checkbox} from "@/components/ui/checkbox";
import {removeFromCartService} from "../services/cartService";
import {useAuth} from "@/features/auth/hooks/useAuth";

type CartItemProps = {
  item: ICartItem["items"][number];
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function CartItem({
  item,
  checked,
  onCheckedChange,
}: CartItemProps) {
  const {user} = useAuth();

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCartService(user!._id!, itemId);
      alert("Item removed from cart");
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  return (
    <div
      className={`flex items-center gap-4 rounded-lg p-4 transition-colors ${checked ? "bg-primary/10 ring-1 ring-primary/15" : "bg-transparent"}`}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mr-2"
      />
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image
          src={item.imageURL || "/assets/images/landing-page/suit.jpg"}
          alt={item.name || "Product"}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-sm text-muted-foreground">{item.category}</p>
        <p className="mt-1 text-xs text-muted-foreground">Size: {item.size}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Color: {item.color}
        </p>
        <p className="mt-2 text-sm font-medium">
          PHP {Number(item.price || 0).toFixed(2)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-input">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            // onClick={() => handleQuantityChange(item.id, -1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-6 text-center text-sm">{item.quantity || 1}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            // onClick={() => handleQuantityChange(item.id, 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="ml-2 text-destructive hover:bg-destructive/10"
          onClick={() => handleRemoveItem(item.outfitId)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
