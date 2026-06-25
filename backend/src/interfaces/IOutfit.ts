export type Variant = {
  _id?: string;
  color: string;
  sizes: [
    {
      size: string;
      stock: number;
      width_cm: number;
      height_cm: number;
    },
  ];
};

export type IOutfit = {
  _id?: string;
  name: string;
  category: string;
  description: string;
  fabricType: string;
  imageURL?: string;
  variants: Variant[];
  price?: number;
  rentalPrice?: number;
  createdAt?: Date;
  updatedAt?: Date;
};
