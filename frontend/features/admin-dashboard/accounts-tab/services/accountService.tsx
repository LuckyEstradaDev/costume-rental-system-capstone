import {api} from "@/lib/axios";

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export const registerAdmin = async (formData: any) => {
  try {
    const registerData = {...formData};

    const {data, status} = await api.post("/api/auth/register", {
      ...registerData,
    });

    return data;
  } catch (err) {
    console.log("Registration failed");
    throw err;
  }
};

export const fetchAdmins = async () => {
  return api.get("/api/admin/admin-accounts");
};
