import {UserRepository} from "../repositories/UserRepository.js";

const userRepo = new UserRepository();

export const getAllRentsAndOrdersService = async () => {
  return userRepo.getAllRentsAndOrders();
};

export const getRentsAndOrdersByUserIdService = async (userId: string) => {
  return userRepo.getRentsAndOrdersByUserId(userId);
};

export const getOrderOrRentByIdService = async (id: string) => {
  return userRepo.getOrderOrRentById(id);
};

export const updateOrderOrRentStatusService = async (
  id: string,
  status: string,
) => {
  return userRepo.updateOrderOrRentStatus(id, status);
};

export const markOrderOrRentPaymentPaidService = async (id: string) => {
  return userRepo.markOrderOrRentPaymentPaid(id);
};
