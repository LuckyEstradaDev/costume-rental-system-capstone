import {api} from "@/lib/axios";
import {IUser} from "@/features/auth/types/IUser";
import type {UserAddress} from "@/features/address/types";
import type {IOtpChallenge} from "@/features/OTP/types/IOTPVerification";

interface RegisterAdminPayload {
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  email: string;
  phoneNumber: string;
  rawPassword: string;
  dateOfBirth: string;
  role: "admin" | "staff";
  address?: UserAddress | null;
}

export const registerAdmin = async (
  formData: RegisterAdminPayload,
): Promise<IOtpChallenge> => {
  const {data} = await api.post<IOtpChallenge>("/api/auth/register", formData);
  return data;
};

export const fetchAdmins = async (): Promise<IUser[]> => {
  const {data} = await api.get<{data: IUser[]}>("/api/admin/admin-accounts");
  return data.data;
};

export type CustomerAccount = Pick<IUser, "_id" | "firstName" | "lastName" | "email" | "phoneNumber" | "profilePicture"> & {
  deactivated?: boolean;
};

export const fetchCustomerAccounts = async () =>
  (await api.get<{data: CustomerAccount[]}>("/api/admin/customer-accounts")).data.data;

export type CustomerAccountDetails = CustomerAccount &
  Pick<IUser, "gender" | "dateOfBirth" | "age" | "address" | "createdAt"> & {
    middleName?: string | null;
  };

export const fetchCustomerAccount = async (id: string) =>
  (await api.get<{data: CustomerAccountDetails}>(`/api/admin/customer-accounts/${encodeURIComponent(id)}`)).data.data;

export const setAccountStatus = (id: string, deactivated: boolean) =>
  api.patch(`/api/admin/accounts/${id}/status`, {deactivated});

export const editStaffAccount = (id: string, profile: Omit<RegisterAdminPayload, "role" | "rawPassword" | "email">) =>
  api.patch(`/api/admin/staff-accounts/${id}`, profile);
