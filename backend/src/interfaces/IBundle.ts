import type {IOutfit} from "./IOutfit.js";

export interface IBundle {
  _id?: string;
  name: string;
  imageURL: string[];
  items: IOutfit[];
  price: number;
  rentalPrice: number;
}
