import axios from "axios";
import {IRegisterService} from "../types/IAuth";

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
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({...formData, role: "user"}),
      },
    );

    const data = await res.json();

    if (res.ok) {
      router.push("/login");
    } else {
      setError(data.message);
    }
  } catch (err) {
    setError("Registration failed");
  }
};
