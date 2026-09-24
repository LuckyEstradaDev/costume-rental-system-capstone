export type Variant = {
  _id?: string;
  color: string;
  sizes: [
    {
      size: string;
      stock: number;
      measurements: {
        chest?: number;
        bust?: number;

        waist?: number;

        hips?: number;

        shoulder?: number;

        sleeveLength?: number;

        neck?: number;

        inseam?: number;

        outfitLength?: number;
      };
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
