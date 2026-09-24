export interface IBundle {
  _id?: string;
  name: string;
  imageURL: string[];
  items: {
    _id: string;
    minimumQuantity: number;
    rentalPackagePrice?: number | null;
    purchasePackagePrice?: number | null;
  }[];
  mode: "rental" | "purchase" | "both";
  purchaseTotal?: number;
  rentalTotal?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
