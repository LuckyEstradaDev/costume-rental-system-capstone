import {OrderModel} from "../models/OrderModel.js";
import {OutfitModel} from "../models/OutfitModel.js";
import type {Snapshot} from "../interfaces/ISnapshot.js";
import {PaymentModel} from "../models/PaymentModel.js";
import {RentModel} from "../models/RentModel.js";
import {UserModel} from "../models/UserModel.js";
import type {IUserInterface} from "../interfaces/IUser.js";
import type {INotification} from "../interfaces/INotification.js";
import {entityIdentifierFilter} from "../utils/entityIdentifier.js";

export class UserRepository {
  //getAllUsers
  //createUser
  //getUserById

  async getRentsAndOrdersByUserId(userId: string) {
    const orders = await OrderModel.find({userID: userId}).lean();
    const rents = await RentModel.find({userID: userId}).lean();

    return this.attachPayments({orders, rents});
  }

  async hasAdminAccess(userId: string) {
    return Boolean(
      await UserModel.exists({
        _id: userId,
        role: {$in: ["admin", "staff"]},
      }),
    );
  }

  async getAllRentsAndOrders() {
    const orders = await OrderModel.find().lean();
    const rents = await RentModel.find().lean();
    const userIds = [...orders, ...rents].map((item) => item.userID);
    const users = await UserModel.find({_id: {$in: userIds}})
      .select("firstName lastName email address")
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
    const identifierFilter = entityIdentifierFilter(id);
    const order = await OrderModel.findOne(identifierFilter).lean();

    if (order) {
      const user = await UserModel.findById(order.userID)
        .select("firstName lastName email address")
        .lean();
      const payment =
        (order.paymentID
          ? await PaymentModel.findById(order.paymentID).lean()
          : null) || (await PaymentModel.findOne({orderID: order._id}).lean());

      return this.attachOutfitReferences({...order, user, payment});
    }

    const rent = await RentModel.findOne(identifierFilter).lean();

    if (!rent) {
      return null;
    }

    const user = await UserModel.findById(rent.userID)
      .select("firstName lastName email address")
      .lean();
    const payment =
      (rent.paymentID
        ? await PaymentModel.findById(rent.paymentID).lean()
        : null) || (await PaymentModel.findOne({orderID: rent._id}).lean());

    return this.attachOutfitReferences({...rent, user, payment});
  }

  async updateOrderOrRentStatus(id: string, status: string) {}

  async markPaymentCancelled(orderId: string, paymentId?: unknown) {
    const query = paymentId
      ? {$or: [{_id: paymentId}, {orderID: orderId}]}
      : {orderID: orderId};

    await PaymentModel.findOneAndUpdate(
      query,
      {status: "cancelled"},
      {new: true},
    );
  }

  private async attachOutfitReferences<
    T extends {items?: Snapshot[] | null},
  >(record: T): Promise<T> {
    const items = record.items ?? [];
    const outfitIds = [
      ...new Set(items.map((item) => item.outfitId).filter(Boolean)),
    ];
    const outfits = outfitIds.length
      ? await OutfitModel.find({_id: {$in: outfitIds}})
          .select("_id referenceID")
          .lean()
      : [];
    const referencesByOutfitId = new Map(
      outfits.map((outfit) => [
        outfit._id.toString(),
        outfit.referenceID ?? null,
      ]),
    );

    return {
      ...record,
      items: items.map((item) => ({
        ...item,
        outfitReferenceID:
          referencesByOutfitId.get(String(item.outfitId)) ?? null,
      })),
    } as T;
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

  async updateUserById(id: string, updateData: Partial<IUserInterface>) {
    return await UserModel.findByIdAndUpdate(
      id,
      {$set: updateData},
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async pushNotificationByUserId(id: string, notification: INotification) {
    return await UserModel.findByIdAndUpdate(id, {
      $push: {
        notifications: notification,
      },
    });
  }

  async markNotificationAsRead(userId: string, notificationId: string) {
    return await UserModel.updateOne(
      {_id: userId, "notifications._id": notificationId},
      {$set: {"notifications.$.unread": false}},
    );
  }
}
