import {api} from "@/lib/axios";
import {IUser} from "@/features/auth/types/IUser";

interface RegisterAdminPayload {
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  email: string;
  phoneNumber: string;
  rawPassword: string;
  role: string;
}

export const registerAdmin = async (
  formData: RegisterAdminPayload,
): Promise<IUser> => {
  try {
    const registerData = {...formData};

    const {data} = await api.post<IUser>("/api/auth/register", {
      ...registerData,
    });

    return data;
  } catch (err) {
    console.log("Registration failed");
    throw err;
  }
};

export const fetchAdmins = async (): Promise<IUser[]> => {
  const {data} = await api.get<{data: IUser[]}>("/api/admin/admin-accounts");
  return data.data;
};
