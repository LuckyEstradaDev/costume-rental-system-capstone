import type {IOutfit} from "../interfaces/IOutfit.js";
import {OutfitRepository} from "../repositories/OutfitRepository.js";

const outfitRepo = new OutfitRepository();

export const createOutfitService = async (data: IOutfit) => {
  return outfitRepo.createOutfit(data);
};

export const getAllOutfitsService = async () => {
  return outfitRepo.getAllOutfits();
};

export const updateOutfitService = async (
  id: string,
  updateData: Partial<IOutfit>,
) => {
  return outfitRepo.updateOutfit(id, updateData);
};

export const deleteOufitService = async (id: string) => {
  return outfitRepo.deleteOutfit(id);
};
