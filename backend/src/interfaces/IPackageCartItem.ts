import type {PackageMode} from "./IPackage.js";
import type {Snapshot} from "./ISnapshot.js";

export type {PackageMode};

export interface IPackageCartItem {
  packageId: string;
  name: string;
  imageURL: string[];
  items: Snapshot[];
  mode: PackageMode;
  purchaseTotal?: number;
  rentalTotal?: number;
}