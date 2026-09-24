export type PackageMode = "rental" | "purchase" | "both";

export interface IPackage {
  _id?: string;
  name: string;
  imageURL: string[];
  items: {
    _id: string;
    minimumQuantity: number;
    rentalPackagePrice?: number | null;
    purchasePackagePrice?: number | null;
  }[];
  mode: PackageMode;
  purchaseTotal?: number;
  rentalTotal?: number;
}
