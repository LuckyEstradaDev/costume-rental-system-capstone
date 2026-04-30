import {useState} from "react";
import type {Snapshot} from "../types/ISnapshot";

let savedCheckoutItems: Snapshot[] = [];

export function useCheckoutItems() {
  const [checkoutItems, setCheckoutItems] =
    useState<Snapshot[]>(savedCheckoutItems);

  const saveCheckoutItems = (items: Snapshot[]) => {
    savedCheckoutItems = items;
    setCheckoutItems(items);
  };

  const clearCheckoutItems = () => {
    savedCheckoutItems = [];
    setCheckoutItems([]);
  };

  return {
    checkoutItems,
    saveCheckoutItems,
    clearCheckoutItems,
  };
}
