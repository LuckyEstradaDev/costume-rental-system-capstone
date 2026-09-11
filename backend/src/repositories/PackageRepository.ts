import type {IPackage} from "../interfaces/IPackage.js";
import PackageModel from "../models/PackageModel.js";

export class PackageRepository {
  async createPackage(data: IPackage) {
    return await PackageModel.create(data);
  }

  async getAllPackages() {
    return await PackageModel.find().sort({createdAt: -1});
  }

  async getPackageById(id: string) {
    return await PackageModel.findById(id);
  }

  async updatePackage(id: string, updateData: Partial<IPackage>) {
    return await PackageModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async deletePackage(id: string) {
    return await PackageModel.findByIdAndDelete(id);
  }
}
