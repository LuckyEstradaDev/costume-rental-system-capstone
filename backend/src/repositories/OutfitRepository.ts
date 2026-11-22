import type {IOutfit} from "../interfaces/IOutfit.js";
import type {Snapshot} from "../interfaces/ISnapshot.js";
import {OrderModel} from "../models/OrderModel.js";
import {OutfitModel} from "../models/OutfitModel.js";
import {RentModel} from "../models/RentModel.js";
import {entityIdentifierFilter} from "../utils/entityIdentifier.js";
import {HTTPError} from "../utils/HttpError.js";

export class OutfitRepository {
  async createOutfit(data: IOutfit) {
    return await OutfitModel.create(data);
  }

  async getAllOutfits() {
    return await OutfitModel.find().sort({createdAt: -1});
  }

  async getOutfitById(id: string) {
    return await OutfitModel.findOne(entityIdentifierFilter(id));
  }

  async updateOutfit(id: string, updateData: Partial<IOutfit>) {
    const {branch, ...rest} = updateData;
    const update: Record<string, unknown> = {};
    const set: Record<string, unknown> = {...rest};

    if (branch === "") {
      update.$unset = {branch: 1};
    } else if (branch !== undefined) {
      set.branch = branch;
    }

    if (Object.keys(set).length > 0) update.$set = set;
    if (Object.keys(update).length === 0) {
      return await OutfitModel.findById(id);
    }

    return await OutfitModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
  }

  async deleteOutfit(id: string) {
    return await OutfitModel.findByIdAndDelete(id);
  }

  async getSoldCountByOutfitId(outfitId: string) {
    const [result] = await OrderModel.aggregate<{sold: number}>([
      {$match: {status: "received", "items.outfitId": outfitId}},
      {$unwind: "$items"},
      {$match: {"items.outfitId": outfitId}},
      {$group: {_id: null, sold: {$sum: "$items.quantity"}}},
    ]);
    return result?.sold ?? 0;
  }

  async getRentedCountByOutfitId(outfitId: string) {
    const [result] = await RentModel.aggregate<{rented: number}>([
      {$match: {status: {$in: ["active", "overdue", "returned"]}, "items.outfitId": outfitId}},
      {$unwind: "$items"},
      {$match: {"items.outfitId": outfitId}},
      {$group: {_id: null, rented: {$sum: "$items.quantity"}}},
    ]);
    return result?.rented ?? 0;
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
    const deducted: Snapshot[] = [];
    try {
      for (const item of items) {
        if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) {
          throw new HTTPError("Stock deduction requires a positive whole quantity.", 400);
        }

        const result = await OutfitModel.updateOne(
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
          },
        ).exec();

        if (result.modifiedCount !== 1) {
          throw new HTTPError("Insufficient stock for one or more items.", 400);
        }
        deducted.push(item);
      }
    } catch (error) {
      await this.restoreStockFromItems(deducted);
      throw error;
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
