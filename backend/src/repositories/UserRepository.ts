import {OrderModel} from "../models/OrderModel.js";
import {RentModel} from "../models/RentModel.js";
import {UserModel} from "../models/UserModel.js";

export class UserRepository {
  //getAllUsers
  //createUser
  //getUserById

  async getRentsAndOrdersByUserId(userId: string) {
    const orders = await OrderModel.find({userID: userId});
    const rents = await RentModel.find({userID: userId});

    return {orders, rents};
  }

  async getAllRentsAndOrders() {
    const orders = await OrderModel.find().lean();
    const rents = await RentModel.find().lean();
    const userIds = [...orders, ...rents].map((item) => item.userID);
    const users = await UserModel.find({_id: {$in: userIds}})
      .select("firstName lastName email")
      .lean();
    const usersById = new Map(
      users.map((user) => [user._id.toString(), user]),
    );

    return {
      orders: orders.map((order) => ({
        ...order,
        user: usersById.get(order.userID.toString()),
      })),
      rents: rents.map((rent) => ({
        ...rent,
        user: usersById.get(rent.userID.toString()),
      })),
    };
  }

  async getOrderOrRentById(id: string) {
    const order = await OrderModel.findById(id);

    if (order) {
      return order;
    }

    return RentModel.findById(id);
  }

  async updateOrderOrRentStatus(id: string, status: string) {
    const order = await OrderModel.findById(id);

    if (order) {
      return OrderModel.findByIdAndUpdate(
        id,
        {status},
        {new: true, runValidators: true},
      );
    }

    const rent = await RentModel.findById(id);

    if (!rent) {
      return null;
    }

    return RentModel.findByIdAndUpdate(
      id,
      {status},
      {new: true, runValidators: true},
    );
  }
}
