import type {INewRent} from "../interfaces/IRent.js";
import {RentRepository} from "../repositories/RentRepository.js";

let rentRepo = new RentRepository();

export const createRentService = async (data: INewRent) => {
  rentRepo.createRent(data);
};

export const getAllRentsService = async () => {
  rentRepo.getAllRents();
};

export const getRentsByUserID = async (id: string) => {
  rentRepo.getRentByUserId(id);
};
