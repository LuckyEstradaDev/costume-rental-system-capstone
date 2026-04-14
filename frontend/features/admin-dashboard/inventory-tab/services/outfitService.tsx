import {IOutfit} from "../types/IOutfit";
import {api} from "@/lib/axios";

export const addOutfitService = async (outfitData: IOutfit) => {
  return api.post("/api/outfits", outfitData);
};

export const fetchOutfitsService = async () => {
  return api.get("/api/outfits");
};

export const deleteOutfitByIdService = async (outfitId: string) => {
  return api.delete(`/api/outfits/${outfitId}`);
};
