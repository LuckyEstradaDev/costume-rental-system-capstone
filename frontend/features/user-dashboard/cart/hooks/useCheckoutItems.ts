import {useState} from "react";
import type {Snapshot} from "../types/ISnapshot";
import type {CheckoutMode} from "../types/checkout";

let savedCheckoutItems: Snapshot[] = [];
let savedCheckoutMode: CheckoutMode = "rent";

export function useCheckoutItems() {
  const [checkoutItems, setCheckoutItems] =
    useState<Snapshot[]>(savedCheckoutItems);
  const [checkoutMode, setCheckoutMode] =
    useState<CheckoutMode>(savedCheckoutMode);

  const saveCheckoutItems = (items: Snapshot[], mode: CheckoutMode) => {
    savedCheckoutItems = items;
    savedCheckoutMode = mode;
    setCheckoutItems(items);
    setCheckoutMode(mode);
  };

  const clearCheckoutItems = () => {
    savedCheckoutItems = [];
    setCheckoutItems([]);
  };

  return {
    checkoutItems,
    checkoutMode,
    saveCheckoutItems,
    clearCheckoutItems,
  };
}
