import {UserModel} from "../models/UserModel.js";
import {UserRepository} from "./UserRepository.js";
import type {INotification} from "../interfaces/INotification.js";

const refundRequestTitle = "Refund requested";

const refundRequestFilter = (orderId: string) => ({
  title: refundRequestTitle,
  orderId,
});

export class NotificationRepository {
  userRepo = new UserRepository();

  async create(id: string, updateData: INotification) {
    await this.userRepo.pushNotificationByUserId(id, updateData);
  }

  async hasRefundRequest(orderId: string) {
    return Boolean(await UserModel.exists({
      notifications: {$elemMatch: refundRequestFilter(orderId)},
    }));
  }

  async notifyAdminsAndStaffOfRefundRequest(
    orderId: string,
    orderReferenceId: string,
    description: string,
  ) {
    return UserModel.updateMany(
      {
        role: {$in: ["admin", "staff"]},
        notifications: {$not: {$elemMatch: refundRequestFilter(orderId)}},
      },
      {
        $push: {
          notifications: {
            ...refundRequestFilter(orderId),
            orderReferenceId,
            description,
            type: "pending",
            unread: true,
          },
        },
      },
    );
  }
}
