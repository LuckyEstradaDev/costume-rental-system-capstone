import {UserRepository} from "../repositories/UserRepository.js";

const userRepo = new UserRepository();

export const getRentsAndOrdersByUserIdService = async (userId: string) => {
  return userRepo.getRentsAndOrdersByUserId(userId);
};
