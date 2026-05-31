import axios from "axios";
import {ILoginService, IRegisterService} from "../types/IAuth";
import {api} from "@/lib/axios";

export const sessionAuthenticationService = async () => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
    {
      withCredentials: true,
    },
  );
  return res;
};

export const registerService = async ({
  formData,
  router,
  setError,
}: IRegisterService) => {
  try {
    const registerData = {...formData};

    const {data, status} = await api.post(`/api/auth/register`, {
      ...registerData,
      role: "user",
    });

    if (status === 200) {
      router.push("/login");
    } else {
      setError(data.message);
    }
  } catch (err) {
    setError("Registration failed");
  }
};

export const loginService = async ({
  formData,
  setAuthenticated,
  setUser,
  router,
  setError,
}: ILoginService) => {
  try {
    const {data, status} = await api.post(`/api/auth/login`, {
      email: formData.email,
      rawPassword: formData.password,
    });

    if (status === 200) {
      try {
        const {data} = await sessionAuthenticationService();
        setAuthenticated(true);
        setUser(data.user);
      } catch (authError) {
        console.error("Failed to refresh auth state:", authError);
      }
      router.push("/dashboard/browse");
    } else {
      setError(data.message);
    }
  } catch (err) {
    setError("Login failed");
  }
};

export {signOutService} from "./signOutService";
