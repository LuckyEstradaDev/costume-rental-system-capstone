import type {IOutfit} from "../interfaces/IOutfit.js";
import {OutfitModel} from "../models/OutfitModel.js";

export class OutfitRepository {
  async createOutfit(data: IOutfit) {
    return await OutfitModel.create(data);
  }

  async getAllOutfits() {
    return await OutfitModel.find();
  }

  async updateOutfit(id: string, updateData: Partial<IOutfit>) {
    return await OutfitModel.findByIdAndUpdate(id, updateData, {new: true});
  }

  async deleteOutfit(id: string) {
    return await OutfitModel.findByIdAndDelete(id);
  }
}
