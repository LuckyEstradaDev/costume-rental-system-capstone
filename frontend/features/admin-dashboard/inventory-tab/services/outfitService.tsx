import {IOutfit} from "../types/IOutfit";
import {api} from "@/lib/axios";

export interface OutfitStats {
  totalOutfits: string;
  rentedOutfits: string;
  lowStockOutfits?: {count: string}[];
}

export const addOutfitService = async (outfitData: IOutfit) => {
  return api.post("/api/outfits", outfitData);
};
const normalizeOutfit = (outfit: IOutfit): IOutfit => {
  if (!outfit || typeof outfit !== "object") return outfit;
  return {
    ...outfit,
    variants: Array.isArray(outfit.variants)
      ? outfit.variants.map((variant) => ({
          ...variant,
          sizes: Array.isArray(variant?.sizes) ? variant.sizes : [],
        }))
      : [],
  };
};

export const fetchOutfitsService = async (): Promise<IOutfit[]> => {
  const res = await api.get<IOutfit[]>("/api/outfits");
  const outfits = Array.isArray(res.data) ? res.data : [];
  return outfits.map(normalizeOutfit);
};

export const deleteOutfitByIdService = async (outfitId: string) => {
  return api.delete(`/api/outfits/${outfitId}`);
};

export const updateOutfit = async ({
  outfitId,
  updateData,
}: {
  outfitId: string;
  updateData: Partial<IOutfit>;
}) => {
  return api.patch(`/api/outfits/${outfitId}`, updateData);
};

export const fetchOutfitById = async (id: string): Promise<IOutfit> => {
  const res = await api.get<IOutfit>(`/api/outfits/${id}`);
  return normalizeOutfit(res.data);
};

export const fetchOutfitStats = async (): Promise<OutfitStats> => {
  const res = await api.get<OutfitStats>("/api/outfits/stats");
  return res.data;
};
