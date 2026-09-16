import {IOutfit, Variant} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import type {IPackage} from "@/features/admin-dashboard/packages/types/IPackage";
import {createContext, useCallback, useMemo, useState} from "react";

export type WizardStep = "outfit" | "color" | "size" | "amount";

export type PackageSelection = {
  outfitId: string;
  outfitName: string;
  variantId: string;
  color: string;
  size: string;
  quantity: number;
  purchasePrice: number;
  rentalPrice: number;
};

export type PackageContextValue = {
  currentStep: WizardStep;
  packageItem: IPackage;
  outfits: IOutfit[];

  activeOutfit: IOutfit | null;
  selectedColor: string;
  selectedVariant: Variant | null;
  selectedSize: string;
  selectedAmount: number;

  selections: PackageSelection[];

  selectOutfit: (outfit: IOutfit) => void;
  selectColor: (color: string) => void;
  selectSize: (size: string) => void;
  setSelectedAmount: (amount: number) => void;
  commitSelection: () => void;
  removeSelection: (index: number) => void;
  goBack: () => void;
  goToOutfitStep: () => void;

  getMinQuantity: (outfitId: string) => number;
  getOutfitCurrentQty: (outfitId: string) => number;
  getOutfitRemaining: (outfitId: string) => number;
  isOutfitComplete: (outfitId: string) => boolean;
  getMaxAmount: () => number;
};

export const PackageContext = createContext<PackageContextValue | undefined>(
  undefined,
);

type PackageProviderProps = {
  children: React.ReactNode;
  packageItem: IPackage;
  outfits: IOutfit[];
};

export function PackageProvider({
  children,
  packageItem,
  outfits,
}: PackageProviderProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("outfit");
  const [activeOutfit, setActiveOutfit] = useState<IOutfit | null>(null);
  const [selectedColor, setSelectedColorState] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedSize, setSelectedSizeState] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(1);
  const [selections, setSelections] = useState<PackageSelection[]>([]);

  const getMinQuantity = useCallback(
    (outfitId: string) =>
      packageItem.items.find((item) => item._id === outfitId)
        ?.minimumQuantity ?? 1,
    [packageItem],
  );

  const getOutfitCurrentQty = useCallback(
    (outfitId: string) =>
      selections
        .filter((s) => s.outfitId === outfitId)
        .reduce((sum, s) => sum + s.quantity, 0),
    [selections],
  );

  const getOutfitRemaining = useCallback(
    (outfitId: string) =>
      Math.max(0, getMinQuantity(outfitId) - getOutfitCurrentQty(outfitId)),
    [getMinQuantity, getOutfitCurrentQty],
  );

  const isOutfitComplete = useCallback(
    (outfitId: string) => getOutfitRemaining(outfitId) === 0,
    [getOutfitRemaining],
  );

  const getMaxAmount = useCallback(() => {
    if (!activeOutfit || !selectedVariant || !selectedSize) return 0;
    const sizeData = selectedVariant.sizes.find((s) => s.size === selectedSize);
    const stock = sizeData?.stock ?? 0;
    const remaining = getOutfitRemaining(activeOutfit._id!);
    return Math.max(0, Math.min(stock, remaining));
  }, [activeOutfit, selectedVariant, selectedSize, getOutfitRemaining]);

  const selectOutfit = useCallback((outfit: IOutfit) => {
    setActiveOutfit(outfit);
    setSelectedColorState("");
    setSelectedVariant(null);
    setSelectedSizeState("");
    setSelectedAmount(1);
    setCurrentStep("color");
  }, []);

  const selectColor = useCallback(
    (color: string) => {
      if (!activeOutfit) return;
      const variant =
        activeOutfit.variants.find((v) => v.color === color) ?? null;
      setSelectedColorState(color);
      setSelectedVariant(variant);
      setSelectedSizeState("");
      setSelectedAmount(1);
      setCurrentStep("size");
    },
    [activeOutfit],
  );

  const selectSize = useCallback((size: string) => {
    setSelectedSizeState(size);
    setSelectedAmount(1);
    setCurrentStep("amount");
  }, []);

  const commitSelection = useCallback(() => {
    if (!activeOutfit || !selectedVariant || !selectedSize || selectedAmount <= 0)
      return;

    const newSelection: PackageSelection = {
      outfitId: activeOutfit._id!,
      outfitName: activeOutfit.name,
      variantId: selectedVariant._id!,
      color: selectedColor,
      size: selectedSize,
      quantity: selectedAmount,
      purchasePrice: Number(activeOutfit.purchasePackagePrice) || 0,
      rentalPrice: Number(activeOutfit.rentalPackagePrice) || 0,
    };

    setSelections((prev) => [...prev, newSelection]);

    setSelectedColorState("");
    setSelectedVariant(null);
    setSelectedSizeState("");
    setSelectedAmount(1);

    const newTotal = getOutfitCurrentQty(activeOutfit._id!) + selectedAmount;
    const min = getMinQuantity(activeOutfit._id!);

    if (newTotal >= min) {
      setActiveOutfit(null);
      setCurrentStep("outfit");
    } else {
      setCurrentStep("color");
    }
  }, [
    activeOutfit,
    selectedVariant,
    selectedSize,
    selectedAmount,
    selectedColor,
    getOutfitCurrentQty,
    getMinQuantity,
  ]);

  const removeSelection = useCallback((index: number) => {
    setSelections((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const goBack = useCallback(() => {
    switch (currentStep) {
      case "color":
        setActiveOutfit(null);
        setSelectedColorState("");
        setSelectedVariant(null);
        setCurrentStep("outfit");
        break;
      case "size":
        setSelectedSizeState("");
        setSelectedAmount(1);
        setCurrentStep("color");
        break;
      case "amount":
        setSelectedSizeState("");
        setSelectedAmount(1);
        setCurrentStep("size");
        break;
    }
  }, [currentStep]);

  const goToOutfitStep = useCallback(() => {
    setActiveOutfit(null);
    setSelectedColorState("");
    setSelectedVariant(null);
    setSelectedSizeState("");
    setSelectedAmount(1);
    setCurrentStep("outfit");
  }, []);

  const value = useMemo<PackageContextValue>(
    () => ({
      currentStep,
      packageItem,
      outfits,
      activeOutfit,
      selectedColor,
      selectedVariant,
      selectedSize,
      selectedAmount,
      selections,
      selectOutfit,
      selectColor,
      selectSize,
      setSelectedAmount,
      commitSelection,
      removeSelection,
      goBack,
      goToOutfitStep,
      getMinQuantity,
      getOutfitCurrentQty,
      getOutfitRemaining,
      isOutfitComplete,
      getMaxAmount,
    }),
    [
      currentStep,
      packageItem,
      outfits,
      activeOutfit,
      selectedColor,
      selectedVariant,
      selectedSize,
      selectedAmount,
      selections,
      selectOutfit,
      selectColor,
      selectSize,
      setSelectedAmount,
      commitSelection,
      removeSelection,
      goBack,
      goToOutfitStep,
      getMinQuantity,
      getOutfitCurrentQty,
      getOutfitRemaining,
      isOutfitComplete,
      getMaxAmount,
    ],
  );

  return (
    <PackageContext.Provider value={value}>{children}</PackageContext.Provider>
  );
}
