export type PackageMode = "rental" | "purchase" | "both";

export interface IPackage {
  _id?: string;
  name: string;
  imageURL: string[];
  items: string[];
  mode: PackageMode;
  purchaseTotal?: number;
  rentalTotal?: number;
}
