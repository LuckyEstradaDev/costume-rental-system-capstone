export type Variant = {
  size: string;
  color: string;
  stock: string;
};

export type IOutfit = {
  _id?: string;
  name: string;
  category: string;
  description: string;
  imageURL?: string;
  variants: Variant[];
  price?: number;
  createdAt?: Date;
  updatedAt?: Date;
};
