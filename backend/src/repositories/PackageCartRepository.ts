import type {IPackageCartItem} from "../interfaces/IPackageCart.js";
import {PackageCartModel} from "../models/PackageCartModel.js";

export class PackageCartRepository {
  async create(data: IPackageCartItem) {
    const newCart = new PackageCartModel(data);
    return await newCart.save();
  }

  async getByUserId(userId: string) {
    return await PackageCartModel.findOne({userId}).sort({createdAt: -1});
  }

  async update(data: IPackageCartItem) {
    return await PackageCartModel.findOneAndUpdate(
      {userId: data.userId},
      {$push: {packageItems: {$each: data.packageItems}}},
      {new: true},
    );
  }

  async deleteItem(userId: string, packageId: string) {
    return await PackageCartModel.findOneAndUpdate(
      {userId},
      {$pull: {packageItems: {packageId}}},
      {new: true},
    );
  }
}
