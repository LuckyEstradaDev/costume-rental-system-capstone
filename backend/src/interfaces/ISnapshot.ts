import type {OutfitBranch} from "./IOutfit.js";

export interface Snapshot {
  outfitId: string;
  outfitReferenceID?: string | null;
  variantId: string;
  size: string;
  color: string;
  quantity: number;
  name: string;
  category: string;
  branch?: OutfitBranch | null;
  imageURL: string;
  price: number;
}
