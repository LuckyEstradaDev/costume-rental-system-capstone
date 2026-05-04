import type {INewRent} from "../interfaces/IRent.js";
import {RentRepository} from "../repositories/RentRepository.js";

let rentRepo = new RentRepository();

export const createRentService = async (data: INewRent) => {
  return rentRepo.createRent(data);
};

export const getAllRentsService = async () => {
  return rentRepo.getAllRents();
};

export const getRentsByUserID = async (id: string) => {
  return rentRepo.getRentByUserId(id);
};

export const updateRentByID = async (
  id: string,
  updateData: Partial<INewRent>,
) => {
  return rentRepo.updateRent(id, updateData);
};
