import {useContext} from "react";
import {PackageContext} from "../providers/PackageProvider";
import type {PackageContextValue} from "../providers/PackageProvider";

export function usePackage(): PackageContextValue {
  const context = useContext(PackageContext);

  if (!context) {
    throw new Error("usePackage must be used within PackageProvider");
  }

  return context;
}
