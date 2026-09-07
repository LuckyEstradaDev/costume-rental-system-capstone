import type {IBundle} from "../interfaces/IBundle.js";
import BundleModel from "../models/BundleModel.js";

export class BundleRepository {
  async createBundle(data: IBundle) {
    return await BundleModel.create(data);
  }

  async getAllBundles() {
    return await BundleModel.find().sort({createdAt: -1});
  }

  async getBundleById(id: string) {
    return await BundleModel.findById(id);
  }

  async updateBundle(id: string, updateData: Partial<IBundle>) {
    return await BundleModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async deleteBundle(id: string) {
    return await BundleModel.findByIdAndDelete(id);
  }
}
