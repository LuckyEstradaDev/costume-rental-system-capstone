import {OrderModel} from "../models/OrderModel.js";
import {OutfitModel} from "../models/OutfitModel.js";
import type {Snapshot} from "../interfaces/ISnapshot.js";
import {PaymentModel} from "../models/PaymentModel.js";
import {RentModel} from "../models/RentModel.js";
import {UserModel} from "../models/UserModel.js";

export class UserRepository {
  //getAllUsers
  //createUser
  //getUserById

  async getRentsAndOrdersByUserId(userId: string) {
    const orders = await OrderModel.find({userID: userId}).lean();
    const rents = await RentModel.find({userID: userId}).lean();

    return this.attachPayments({orders, rents});
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
      orders: await this.attachPaymentsToItems(
        orders.map((order) => ({
          ...order,
          user: usersById.get(order.userID.toString()),
        })),
      ),
      rents: await this.attachPaymentsToItems(
        rents.map((rent) => ({
          ...rent,
          user: usersById.get(rent.userID.toString()),
        })),
      ),
    };
  }

  async getOrderOrRentById(id: string) {
    const order = await OrderModel.findById(id).lean();

    if (order) {
      const user = await UserModel.findById(order.userID)
        .select("firstName lastName email")
        .lean();
      const payment =
        (order.paymentID
          ? await PaymentModel.findById(order.paymentID).lean()
          : null) || (await PaymentModel.findOne({orderID: order._id}).lean());

      return {...order, user, payment};
    }

    const rent = await RentModel.findById(id).lean();

    if (!rent) {
      return null;
    }

    const user = await UserModel.findById(rent.userID)
      .select("firstName lastName email")
      .lean();
    const payment =
      (rent.paymentID
        ? await PaymentModel.findById(rent.paymentID).lean()
        : null) || (await PaymentModel.findOne({orderID: rent._id}).lean());

    return {...rent, user, payment};
  }

  async updateOrderOrRentStatus(id: string, status: string) {
    const order = await OrderModel.findById(id);

    if (order) {
      const updateData = {status};

      if (status === "cancelled" && order.status !== "cancelled") {
        await this.markPaymentFailed(order._id.toString(), order.paymentID);
        await this.restoreStockFromItems(order.items);
      }

      await OrderModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      return this.getOrderOrRentById(id);
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

    if (
      (status === "returned" || status === "cancelled") &&
      rent.status !== "returned" &&
      rent.status !== "cancelled"
    ) {
      if (status === "cancelled") {
        //if the rent is cancelled we mark the payment as failed,
        await this.markPaymentFailed(rent._id.toString(), rent.paymentID);
      }
      await this.restoreStockFromItems(rent.items);
    }

    await RentModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return this.getOrderOrRentById(id);
  }

  private async restoreStockFromItems(items: Snapshot[]) {
    if (!items?.length) {
      return;
    }

    await Promise.all(
      items.map((item) =>
        OutfitModel.findByIdAndUpdate(
          item.outfitId,
          {$inc: {[`variants.$[variant].sizes.$[size].stock`]: item.quantity}},
          {
            arrayFilters: [
              {"variant._id": item.variantId},
              {"size.size": item.size},
            ],
          },
        ).exec(),
      ),
    );
  }

  private async markPaymentFailed(orderId: string, paymentId?: unknown) {
    const query = paymentId
      ? {$or: [{_id: paymentId}, {orderID: orderId}]}
      : {orderID: orderId};

    await PaymentModel.findOneAndUpdate(query, {status: "failed"}, {new: true});
  }

  async markOrderOrRentPaymentPaid(id: string, cash?: number) {
    const order = await OrderModel.findById(id);

    if (order) {
      if (order.status === "cancelled") {
        throw new Error("Cannot mark payment as paid for a cancelled order.");
      }

      const updateData: Record<string, Date | number | string> = {
        paidAt: new Date(),
        status: "paid",
      };

      if (cash !== undefined) {
        updateData.cash = cash;
        updateData.change = cash - order.totalAmount;
      }

      await PaymentModel.findByIdAndUpdate(order.paymentID, updateData, {
        new: true,
        runValidators: true,
      });

      return this.getOrderOrRentById(id);
    }

    const rent = await RentModel.findById(id);

    if (!rent) {
      return null;
    }

    if (rent.status === "cancelled") {
      throw new Error("Cannot mark payment as paid for a cancelled rent.");
    }

    const updateData: Record<string, Date | number | string> = {
      paidAt: new Date(),
      status: "paid",
    };

    if (cash !== undefined) {
      updateData.cash = cash;
      updateData.change = cash - rent.totalAmount;
    }

    await PaymentModel.findByIdAndUpdate(rent.paymentID, updateData, {
      new: true,
      runValidators: true,
    });

    return this.getOrderOrRentById(id);
  }

  private async attachPayments(data: {orders: any[]; rents: any[]}) {
    return {
      orders: await this.attachPaymentsToItems(data.orders),
      rents: await this.attachPaymentsToItems(data.rents),
    };
  }

  private async attachPaymentsToItems<
    T extends {_id?: unknown; paymentID?: unknown},
  >(items: T[]) {
    const paymentIds = items
      .map((item) => item.paymentID)
      .filter(Boolean)
      .map(String);
    const itemIds = items
      .map((item) => item._id)
      .filter(Boolean)
      .map(String);
    const paymentsById = await PaymentModel.find({
      _id: {$in: paymentIds},
    }).lean();
    const paymentsByOrder = await PaymentModel.find({
      orderID: {$in: itemIds},
    }).lean();
    const payments = [...paymentsById, ...paymentsByOrder];
    const paymentsByPaymentId = new Map(
      payments.map((payment) => [payment._id.toString(), payment]),
    );
    const paymentsByOrderId = new Map(
      payments.map((payment) => [payment.orderID?.toString(), payment]),
    );

    return items.map((item) => ({
      ...item,
      payment: item.paymentID
        ? paymentsByPaymentId.get(item.paymentID.toString()) ||
          paymentsByOrderId.get(item._id?.toString())
        : paymentsByOrderId.get(item._id?.toString()) || null,
    }));
  }
}
