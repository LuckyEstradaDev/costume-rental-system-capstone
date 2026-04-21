"use client";

import Image from "next/image";
import {Trash2, Minus, Plus} from "lucide-react";
import {Button} from "@/components/ui/button";

export function CartItem({item}: {item: any}) {
  return (
    <div className="flex gap-4 p-4">
      {/* Product Image */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image
          src={item.imageURL || "/assets/images/landing-page/suit.jpg"}
          alt={item.name || "Product"}
          fill
          className="object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-sm text-muted-foreground">{item.category}</p>
        {item.size && (
          <p className="mt-1 text-xs text-muted-foreground">
            Size: {item.size} {item.color && `• Color: ${item.color}`}
          </p>
        )}
        <p className="mt-2 text-sm font-medium">${item.price?.toFixed(2) || "0.00"}</p>
      </div>

      {/* Quantity and Actions */}
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
          // onClick={() => handleRemoveItem(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
