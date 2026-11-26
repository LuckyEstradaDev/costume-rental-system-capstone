import {AdminRepository} from "../repositories/AdminRepository.js";
const adminRepo = new AdminRepository();

export const getUserCount = async () => {
  return await adminRepo.getUserCount();
};

export const getAdminService = async () => {
  return await adminRepo.getAdmins();
};

export const getCustomerAccounts = () => adminRepo.getCustomers();
export const getCustomerAccount = (id: string) => adminRepo.getCustomer(id);
export const setAccountStatus = (id: string, deactivated: boolean) => adminRepo.setAccountStatus(id, deactivated);
export const isStaffAccount = (id: string) => adminRepo.isStaff(id);
