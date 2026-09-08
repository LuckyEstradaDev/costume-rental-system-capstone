import {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";

export interface IBundle {
  _id?: string;
  name: string;
  imageURL: string[];
  items: IOutfit[];
  price: number;
  rentalPrice: number;
}
