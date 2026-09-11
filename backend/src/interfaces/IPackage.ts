import type {IOutfit} from "./IOutfit.js";

export type PackageMode = "rental" | "purchase" | "both";

export interface IPackage {
  _id?: string;
  name: string;
  imageURL: string[];
  items: IOutfit[];
  mode: PackageMode;
  purchaseTotal?: number;
  rentalTotal?: number;
}
