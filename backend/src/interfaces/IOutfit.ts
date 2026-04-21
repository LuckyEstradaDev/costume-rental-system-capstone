export type Variant = {
  _id?: string;
  color: string;
  sizes: [
    {
      size: string;
      stock: number;
    },
  ];
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
