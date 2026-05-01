import {OrderModel} from "../models/OrderModel.js";
import {RentModel} from "../models/RentModel.js";

export class UserRepository {
  //getAllUsers
  //createUser
  //getUserById

  async getRentsAndOrdersByUserId(userId: string) {
    const orders = await OrderModel.find({userID: userId});
    const rents = await RentModel.find({userID: userId});

    return {orders, rents};
  }
}
