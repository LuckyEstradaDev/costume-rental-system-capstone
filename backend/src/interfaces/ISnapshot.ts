import {Types} from "mongoose";

export interface Snapshot {
  outfitId: string;
  outfitReferenceID?: string | null;
  variantId: string;
  size: string;
  color: string;
  quantity: number;
  name: string;
  category: string;
  imageURL: string;
  price: number;
}
