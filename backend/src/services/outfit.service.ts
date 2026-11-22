import type {IOutfit} from "../interfaces/IOutfit.js";
import {OutfitRepository} from "../repositories/OutfitRepository.js";

const outfitRepo = new OutfitRepository();

export const createOutfitService = async (data: IOutfit) => {
  return outfitRepo.createOutfit(data);
};

export const getAllOutfitsService = async () => {
  return outfitRepo.getAllOutfits();
};

export const getOutfitByIdService = async (id: string) => {
  return outfitRepo.getOutfitById(id);
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

export const getOutfitStatsService = async () => {
  return outfitRepo.getOutfitStats();
};

export const getOutfitSoldCountService = async (id: string) => {
  const outfit = await outfitRepo.getOutfitById(id);
  if (!outfit) {
    return 0;
  }
  return outfitRepo.getSoldCountByOutfitId(outfit._id.toString());
};

export const getOutfitRentedCountService = async (id: string) => {
  const outfit = await outfitRepo.getOutfitById(id);
  return outfit ? outfitRepo.getRentedCountByOutfitId(outfit._id.toString()) : 0;
};
