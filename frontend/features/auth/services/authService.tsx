import axios from "axios";
import {ILoginResponse, ILoginService, IRegisterService} from "../types/IAuth";
import type {IOtpChallenge} from "@/features/OTP/types/IOTPVerification";
import {api} from "@/lib/axios";

/** Friendly fallback when the server gives us nothing usable. */
export const serverErrorMessage = (err: unknown): string => {
  const message = (err as {response?: {data?: {message?: string}}})?.response
    ?.data?.message;
  return typeof message === "string" && message.trim() !== ""
    ? message
    : "Something went wrong. Please try again.";
};

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
  setError,
}: IRegisterService): Promise<IOtpChallenge | null> => {
  try {
    const registerData = {...formData};

    const {data, status} = await api.post<IOtpChallenge & {message: string}>(
      `/api/auth/register`,
      {
        ...registerData,
        role: "user",
      },
    );

    if (status === 200 && data.userId) {
      return {
        userId: data.userId,
        email: data.email ?? registerData.email.trim().toLowerCase(),
        otp: data.otp ?? "",
      };
    }

    // Account created but the response lacks the challenge details, so
    // verification cannot start here; sign-in is the fallback.
    if (status === 200) {
      setError("Account created. Please sign in to verify your email.");
      return null;
    }

    setError(data.message);
    return null;
  } catch (err) {
    setError(serverErrorMessage(err));
    return null;
  }
};

export const loginService = async ({
  formData,
  setAuthenticated,
  setUser,
  router,
  setError,
}: ILoginService): Promise<IOtpChallenge | null> => {
  try {
    const {data, status} = await api.post<ILoginResponse>(`/api/auth/login`, {
      email: formData.email,
      rawPassword: formData.password,
    });

    // The backend returns the user document rather than a flat userId.
    const userId = data.userId ?? data.user?._id;

    // Correct credentials do not sign in: the backend issues a fresh OTP,
    // so login only completes after verification on this route.
    if (status === 200 && userId) {
      return {
        userId,
        email: data.email ?? formData.email.trim().toLowerCase(),
        otp: data.otp ?? "",
      };
    }

    if (status === 200) {
      // Check overdue rentals before refreshing the session so any new
      // notifications are included in the user payload. Non-fatal on error.
      try {
        await api.post(`/api/rents/check-overdue`);
      } catch (overdueError) {
        console.error("Overdue rent check failed:", overdueError);
      }

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
    return null;
  } catch (err) {
    setError(serverErrorMessage(err));
    return null;
  }
};

export {signOutService} from "./signOutService";
