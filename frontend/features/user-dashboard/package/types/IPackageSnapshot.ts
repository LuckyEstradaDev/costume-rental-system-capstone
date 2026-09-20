export type PackageMode = "rental" | "purchase" | "both";
export interface IPackageSnapshot {
  packageId: string;
  name: string;
  imageURL: string[];
  items: {
    _id: string;
    variantId: string;
    size: string;
    quantity: number;
    purchasePrice: number;
    rentalPrice: number;
  }[];
  mode: PackageMode;
  purchaseTotal?: number;
  rentalTotal?: number;
  /** Added by Mongoose timestamps on the package snapshot schema. Used to sort the merged cart list. */
  createdAt?: string | Date;
}
