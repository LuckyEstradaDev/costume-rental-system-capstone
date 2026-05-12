import type {INewRent} from "../interfaces/IRent.js";
import type {Snapshot} from "../interfaces/ISnapshot.js";
import {OutfitModel} from "../models/OutfitModel.js";
import {RentModel} from "../models/RentModel.js";

export class RentRepository {
  async createRent(data: INewRent) {
    const rent = RentModel.create(data);
    const outfit: any = data.items.map((item: Snapshot) => {
      return {
        outfitID: item.outfitId,
        variantID: item.variantId,
        size: item.size,
        quantity: item.quantity,
      };
    });

    //deduct stocks from the outfit variants when placing orders
    await Promise.all(
      outfit.map((item: any) =>
        OutfitModel.findByIdAndUpdate(
          item.outfitID,
          {$inc: {[`variants.$[variant].sizes.$[size].stock`]: -item.quantity}},
          {
            arrayFilters: [
              {"variant._id": item.variantID},
              {"size.size": item.size},
            ],
          },
        ).exec(),
      ),
    );

    return rent;
  }

  async getAllRents() {
    return await RentModel.find();
  }

  async getRentByUserId(id: string) {
    return await RentModel.find({
      userID: id,
    });
  }

  async updateRent(id: string, updateData: Partial<INewRent>) {
    return await RentModel.findByIdAndUpdate(id, updateData, {new: true});
  }
}
