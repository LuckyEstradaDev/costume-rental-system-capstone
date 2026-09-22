import {useState} from "react";
import type {Snapshot} from "../types/ISnapshot";
import type {CheckoutMode} from "../types/checkout";
import type {IPackageCartItem} from "../../package/types/IPackageCartItem";

let savedCheckoutItems: Snapshot[] = [];
let savedCheckoutPackages: IPackageCartItem[] = [];
let savedCheckoutMode: CheckoutMode = "rent";

export function useCheckoutItems() {
  const [checkoutItems, setCheckoutItems] =
    useState<Snapshot[]>(savedCheckoutItems);
  const [checkoutPackages, setCheckoutPackages] = useState<
    IPackageCartItem[]
  >(savedCheckoutPackages);
  const [checkoutMode, setCheckoutMode] =
    useState<CheckoutMode>(savedCheckoutMode);

  const saveCheckoutItems = (items: Snapshot[], mode: CheckoutMode) => {
    savedCheckoutItems = items;
    savedCheckoutPackages = [];
    savedCheckoutMode = mode;
    setCheckoutItems(items);
    setCheckoutPackages([]);
    setCheckoutMode(mode);
  };

  const saveCheckoutPackages = (
    packages: IPackageCartItem[],
    mode: CheckoutMode,
  ) => {
    savedCheckoutPackages = packages;
    savedCheckoutItems = [];
    savedCheckoutMode = mode;
    setCheckoutPackages(packages);
    setCheckoutItems([]);
    setCheckoutMode(mode);
  };

  const clearCheckoutItems = () => {
    savedCheckoutItems = [];
    setCheckoutItems([]);
  };

  const clearCheckoutPackages = () => {
    savedCheckoutPackages = [];
    setCheckoutPackages([]);
  };

  return {
    checkoutItems,
    checkoutPackages,
    checkoutMode,
    saveCheckoutItems,
    saveCheckoutPackages,
    clearCheckoutItems,
    clearCheckoutPackages,
  };
}