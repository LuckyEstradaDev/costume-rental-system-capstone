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
}
