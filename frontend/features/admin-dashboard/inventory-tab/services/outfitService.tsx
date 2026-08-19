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

export const fetchOutfitsService = async (): Promise<IOutfit[]> => {
  const res = await api.get<IOutfit[]>("/api/outfits");
  return res.data;
};

export const deleteOutfitByIdService = async (outfitId: string) => {
  return api.delete(`/api/outfits/${outfitId}`);
};

export const updateOutfit = async ({
  outfitId,
  updateData,
}: {
  outfitId: string;
  updateData: IOutfit;
}) => {
  return api.patch(`/api/outfits/${outfitId}`, updateData);
};

export const fetchOutfitById = async (id: string) => {
  return api.get(`/api/outfits/${id}`);
};

export const fetchOutfitStats = async (): Promise<OutfitStats> => {
  const res = await api.get<OutfitStats>("/api/outfits/stats");
  return res.data;
};
