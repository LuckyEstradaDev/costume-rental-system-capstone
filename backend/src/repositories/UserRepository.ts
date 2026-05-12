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
    const usersById = new Map(users.map((user) => [user._id.toString(), user]));

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
    const order = await OrderModel.findById(id).lean();

    if (order) {
      const user = await UserModel.findById(order.userID)
        .select("firstName lastName email")
        .lean();

      return {...order, user};
    }

    const rent = await RentModel.findById(id).lean();

    if (!rent) {
      return null;
    }

    const user = await UserModel.findById(rent.userID)
      .select("firstName lastName email")
      .lean();

    return {...rent, user};
  }

  async updateOrderOrRentStatus(id: string, status: string) {
    const order = await OrderModel.findById(id);

    if (order) {
      const updateData = {status};

      return OrderModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
    }

    const rent = await RentModel.findById(id);

    if (!rent) {
      return null;
    }

    const updateData: {
      status: string;
      pickupTime?: Date;
      returnTime?: Date;
      duedate?: Date;
    } = {
      status,
    };

    if (status === "active" && !rent.pickupTime) {
      const pickupTime = new Date();

      updateData.pickupTime = pickupTime;

      const dueDate = new Date(pickupTime);
      dueDate.setDate(dueDate.getDate() + rent!.rentalDays!);

      updateData.duedate = dueDate;
    }

    if (status === "returned" && !rent.returnTime) {
      updateData.returnTime = new Date();
    }

    return RentModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async markOrderOrRentPaymentPaid(id: string) {
    const order = await OrderModel.findById(id);

    if (order) {
      return OrderModel.findByIdAndUpdate(
        id,
        {"payment.paidAt": new Date()},
        {new: true, runValidators: true},
      );
    }

    const rent = await RentModel.findById(id);

    if (!rent) {
      return null;
    }

    return RentModel.findByIdAndUpdate(
      id,
      {"payment.paidAt": new Date()},
      {new: true, runValidators: true},
    );
  }
}
