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
    /** Optional enriched display data. The backend snapshot schema currently
     * stores only the fields above, so the cart UI resolves name/image/category
     * via `fetchOutfitById` when these are absent (sample data sets them to
     * keep the demo fully rendered). */
    name?: string;
    category?: string;
    imageURL?: string;
  }[];
  mode: PackageMode;
  purchaseTotal?: number;
  rentalTotal?: number;
  /** Added by Mongoose timestamps on the package snapshot schema. Used to sort the merged cart list. */
  createdAt?: string | Date;
}
