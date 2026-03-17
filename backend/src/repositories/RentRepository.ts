import type {INewRent} from "../interfaces/IRent.js";
import {RentModel} from "../models/RentModel.js";

export class RentRepository {
  async createRent(data: INewRent) {
    const rent = await RentModel.create(data);
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
