import type {IOutfit} from "../interfaces/IOutfit.js";
import {OutfitModel} from "../models/OutfitModel.js";
import {RentModel} from "../models/RentModel.js";

export class OutfitRepository {
  async createOutfit(data: IOutfit) {
    return await OutfitModel.create(data);
  }

  async getAllOutfits() {
    return await OutfitModel.find().sort({createdAt: -1});
  }

  async getOutfitById(id: string) {
    return await OutfitModel.findById(id);
  }

  async updateOutfit(id: string, updateData: Partial<IOutfit>) {
    return await OutfitModel.findByIdAndUpdate(id, updateData, {new: true});
  }

  async deleteOutfit(id: string) {
    return await OutfitModel.findByIdAndDelete(id);
  }

  async getOutfitStats() {
    const totalOutfits = await OutfitModel.countDocuments();
    const lowStockOutfits = await OutfitModel.aggregate([
      {
        $addFields: {
          totalStock: {
            $sum: {
              $map: {
                input: "$variants",
                as: "variant",
                in: {
                  $sum: "$$variant.sizes.stock",
                },
              },
            },
          },
        },
      },
      {
        $match: {
          totalStock: {$lte: 5},
        },
      },
      {
        $count: "count",
      },
    ]);
    const rentedOutfits = await RentModel.countDocuments({status: "active"});
    return {
      totalOutfits,
      lowStockOutfits: lowStockOutfits,
      rentedOutfits,
    };
  }
}
