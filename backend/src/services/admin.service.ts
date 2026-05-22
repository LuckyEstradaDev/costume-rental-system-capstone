import {AdminRepository} from "../repositories/AdminRepository.js";
const adminRepo = new AdminRepository();

export const getUserCount = async () => {
  return await adminRepo.getUserCount();
};
