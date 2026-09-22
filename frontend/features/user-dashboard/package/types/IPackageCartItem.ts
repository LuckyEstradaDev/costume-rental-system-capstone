import type {Snapshot} from "@/features/user-dashboard/cart/types/ISnapshot";

export type PackageMode = "rental" | "purchase" | "both";

export interface IPackageCartItem {
  packageId: string;
  name: string;
  imageURL: string[];
  items: Snapshot[];
  mode: PackageMode;
  purchaseTotal?: number;
  rentalTotal?: number;
  /** Added by Mongoose timestamps on the package snapshot schema. Used to sort the merged cart list. */
  createdAt?: string | Date;
}