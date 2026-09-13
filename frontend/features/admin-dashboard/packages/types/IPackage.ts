export interface IPackage {
  _id?: string;
  name: string;
  imageURL: string[];
  items: {
    _id: string;
    minimumQuantity: number;
  }[];
  mode: "rental" | "purchase" | "both";
  purchaseTotal?: number;
  rentalTotal?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
