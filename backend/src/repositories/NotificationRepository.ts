import { UserModel } from "../models/UserModel.js";
import { UserRepository } from "./UserRepository.js";
import type { IUserInterface } from "../interfaces/IUser.js";

export class NotificationRepository extends UserRepository {
    
    async create(id: string, updateData: Partial<IUserInterface>) {
        this.updateUserById(id, updateData)
    }
}