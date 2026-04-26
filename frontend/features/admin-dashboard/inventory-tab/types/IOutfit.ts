export type Variant = {
  _id?: string;
  color: string;
  sizes: {
    size: string;
    stock: number;
  }[];
};

export type IOutfit = {
  _id?: string;
  name: string;
  category: string;
  description: string;
  imageURL?: File | string | undefined;
  variants: Variant[] | [];
  price?: string;
  rentalPrice?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
