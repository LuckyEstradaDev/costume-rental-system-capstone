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
