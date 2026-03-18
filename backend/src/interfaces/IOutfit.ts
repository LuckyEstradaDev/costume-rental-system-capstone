export interface IOutfit {
  name: string;
  category: string;
  description: string;
  imageURL?: string;
  availableColors: string[];
  availableSizes: string[];
  stock?: number;
  price?: number;
  outfitsSold?: number;
  outfits_rented?: number;
}
