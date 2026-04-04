import axios from "axios";
import {ILoginService, IRegisterService} from "../types/IAuth";

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

export const loginService = async ({
  formData,
  setAuthenticated,
  setUser,
  router,
  setError,
}: ILoginService) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          rawPassword: formData.password,
        }),
      },
    );

    if (res.ok) {
      try {
        const {data} = await sessionAuthenticationService();
        setAuthenticated(true);
        setUser(data.user);
      } catch (authError) {
        console.error("Failed to refresh auth state:", authError);
        // Optionally handle this (e.g., show an error or retry)
      }
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setError(data.message);
    }
  } catch (err) {
    setError("Login failed");
  }
};
