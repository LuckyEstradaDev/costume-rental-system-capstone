import {UserModel} from "../models/UserModel.js";

export class AdminRepository {
  async getUserCount() {
    return await UserModel.countDocuments();
  }
}
