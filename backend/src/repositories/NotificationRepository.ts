import {UserRepository} from "./UserRepository.js";
import type {INotification} from "../interfaces/INotification.js";

export class NotificationRepository {
  userRepo = new UserRepository();

  async create(id: string, updateData: INotification) {
    this.userRepo.pushNotificationByUserId(id, updateData);
  }
}
