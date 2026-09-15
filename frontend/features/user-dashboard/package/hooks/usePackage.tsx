import { IOutfit } from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import { useState } from "react";

export default function usePackageCart() {
  const [selectedOutfit, setSelectedOutfit] = useState<IOutfit>();
  const [selectedColor, setSelectedColor] = useState<string>();
  const [selectedSize, setSelectedSize] = useState<string>();
  const [selectedOutfit, setSelectedOutfit] = useState<IOutfit>();
}
