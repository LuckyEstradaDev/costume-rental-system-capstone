import type {IPayment} from "../interfaces/IPayment.js";
import type {IRent} from "../interfaces/IRent.js";
import {RentRepository} from "../repositories/RentRepository.js";

let rentRepo = new RentRepository();

export const createRentService = async (data: IRent, paymentData: IPayment) => {
  return rentRepo.createRent(data, paymentData);
};

export const getAllRentsService = async () => {
  return rentRepo.getAllRents();
};

export const getRentsByUserID = async (id: string) => {
  return rentRepo.getRentByUserId(id);
};

export const updateRentByID = async (
  id: string,
  updateData: Partial<IRent>,
) => {
  return rentRepo.updateRent(id, updateData);
};
