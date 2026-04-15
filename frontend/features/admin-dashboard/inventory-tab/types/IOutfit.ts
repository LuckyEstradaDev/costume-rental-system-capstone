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
  imageURL?: File | string | undefined;
  variants: Variant[];
  price?: number | string;
  createdAt?: Date;
  updatedAt?: Date;
};
