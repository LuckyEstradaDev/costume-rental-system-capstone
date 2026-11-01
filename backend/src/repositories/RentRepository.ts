import type {IPackageCart} from "../interfaces/IPackageCart.js";
import type {IPayment} from "../interfaces/IPayment.js";
import type {IRent} from "../interfaces/IRent.js";
import type {Snapshot} from "../interfaces/ISnapshot.js";
import {CartModel} from "../models/CartModel.js";
import {OutfitModel} from "../models/OutfitModel.js";
import {PackageCartModel} from "../models/PackageCartModel.js";
import {PaymentModel} from "../models/PaymentModel.js";
import {RentModel} from "../models/RentModel.js";
import {entityIdentifierFilter} from "../utils/entityIdentifier.js";
import {HTTPError} from "../utils/HttpError.js";

export class RentRepository {
  async createRent(data: IRent, paymentData: IPayment) {
    const rent = await RentModel.create(data);
    const paymentDocument = await PaymentModel.create({
      orderID: rent._id,
      totalAmount: rent.totalAmount,
      status: "pending",
      method: paymentData.method,
    });

    rent.paymentID = paymentDocument._id;
    await rent.save();

    await Promise.all(
      data.items.map((item: Snapshot) =>
        //remove the exact rented item from the cart after rent has been placed
        CartModel.findOneAndUpdate(
          {userId: data.userID.toString()},
          {
            $pull: {
              items: {
                outfitId: item.outfitId,
                variantId: item.variantId,
                size: item.size,
                color: item.color,
              },
            },
          },
        ).exec(),
      ),
    );

    return rent;
  }

  async getAllRents() {
    const rents = await RentModel.find().lean().sort({createdAt: -1});
    return this.attachPayments(rents);
  }

  async getById(id: string) {
    const rent = await RentModel.findOne(entityIdentifierFilter(id)).lean();
    return rent;
  }

  async getRentByUserId(id: string) {
    const rents = await RentModel.find({
      userID: id,
    }).lean();

    return this.attachPayments(rents);
  }

  async findByIdAndUpdate(id: string, updateData: Partial<IRent>) {
    return await RentModel.findByIdAndUpdate(id, updateData, {new: true});
  }

  async markPastDueActiveRentsOverdue(scope: {userID?: string} = {}) {
    const now = new Date();

    const result = await RentModel.updateMany(
      {
        status: "active",
        duedate: {$lt: now},
        ...scope,
      },
      {$set: {status: "overdue"}},
    );

    return result.modifiedCount;
  }

  async findUnnotifiedOverdueRents(scope: {userID?: string} = {}) {
    return RentModel.find({
      status: "overdue",
      duedate: {$lt: new Date()},
      overdueNotified: {$ne: true},
      ...scope,
    }).lean();
  }

  async findUnnotifiedNearOverdueRents(scope: {userID?: string} = {}) {
    const now = new Date();
    const oneDayFromNow = new Date(now);
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    return RentModel.find({
      status: "active",
      duedate: {$gte: now, $lte: oneDayFromNow},
      nearOverdueNotified: {$ne: true},
      ...scope,
    }).lean();
  }

  // Atomic claim: only one concurrent caller wins, preventing duplicate notifications.
  async claimOverdueNotification(id: string) {
    return RentModel.findOneAndUpdate(
      {_id: id, overdueNotified: {$ne: true}},
      {$set: {overdueNotified: true}},
      {new: true},
    );
  }

  async claimNearOverdueNotification(id: string) {
    return RentModel.findOneAndUpdate(
      {_id: id, nearOverdueNotified: {$ne: true}},
      {$set: {nearOverdueNotified: true}},
      {new: true},
    );
  }

  async releaseOverdueNotification(id: string) {
    return RentModel.updateOne(
      {_id: id},
      {$set: {overdueNotified: false}},
    );
  }

  async releaseNearOverdueNotification(id: string) {
    return RentModel.updateOne(
      {_id: id},
      {$set: {nearOverdueNotified: false}},
    );
  }

  async createPackageRent(
    rentData: IRent,
    items: Snapshot[],
    packageData: IPackageCart,
    payment: IPayment,
    purchasedPackageIds: string[],
  ) {
    //create the rent document
    const rent = await RentModel.create(rentData);

    //create the payment document and use the rent ID as its reference key
    const paymentDocument = await PaymentModel.create({
      orderID: rent._id,
      totalAmount: rent.totalAmount,
      status: "pending",
      method: payment.method,
    });

    //add the payment document reference to the rent document
    rent.paymentID = paymentDocument._id;
    await rent.save();

    //remove the package from the cart

    await PackageCartModel.findOneAndUpdate(
      {userId: packageData.userId},
      {$pull: {packageItems: {packageId: {$in: purchasedPackageIds}}}},
    );

    return rent;
  }

  private async attachPayments<T extends {_id?: unknown; paymentID?: unknown}>(items: T[]) {
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
    const paymentsByPaymentId = new Map(payments.map((payment) => [payment._id.toString(), payment]));
    const paymentsByOrderId = new Map(payments.map((payment) => [payment.orderID?.toString(), payment]));

    return items.map((item) => ({
      ...item,
      payment: item.paymentID
        ? paymentsByPaymentId.get(item.paymentID.toString()) || paymentsByOrderId.get(item._id?.toString())
        : paymentsByOrderId.get(item._id?.toString()) || null,
    }));
  }
}
