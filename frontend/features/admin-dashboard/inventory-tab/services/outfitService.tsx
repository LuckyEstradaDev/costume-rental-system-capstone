import {IOutfit} from "../types/IOutfit";
import {api} from "@/lib/axios";

export const addOutfitService = async (outfitData: IOutfit) => {
  return api.post("/api/outfits", outfitData);
};
