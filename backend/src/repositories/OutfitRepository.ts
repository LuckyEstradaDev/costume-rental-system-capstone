import type {IOutfit} from "../interfaces/IOutfit.js";
import type {Snapshot} from "../interfaces/ISnapshot.js";
import {OutfitModel} from "../models/OutfitModel.js";
import {RentModel} from "../models/RentModel.js";
import {HTTPError} from "../utils/HttpError.js";

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

  async deductStockFromItems(items: Snapshot[]) {
    const results = await Promise.all(
      items.map((item: Snapshot) =>
        OutfitModel.findOneAndUpdate(
          {
            _id: item.outfitId,
            variants: {
              $elemMatch: {
                _id: item.variantId,
                sizes: {
                  $elemMatch: {
                    size: item.size,
                    stock: {$gte: item.quantity},
                  },
                },
              },
            },
          },
          {
            $inc: {[`variants.$[variant].sizes.$[size].stock`]: -item.quantity},
          },
          {
            arrayFilters: [{"variant._id": item.variantId}, {"size.size": item.size}],
            new: true,
          },
        ).exec(),
      ),
    );

    if (results.some((result) => !result)) {
      throw new HTTPError("Insufficient stock for one or more items.", 400);
    }
  }

  async restoreStockFromItems(items: Snapshot[]) {
    if (!items?.length) {
      return;
    }

    await Promise.all(
      items.map((item) =>
        OutfitModel.findByIdAndUpdate(
          item.outfitId,
          {$inc: {[`variants.$[variant].sizes.$[size].stock`]: item.quantity}},
          {
            arrayFilters: [{"variant._id": item.variantId}, {"size.size": item.size}],
          },
        ).exec(),
      ),
    );
  }
}
