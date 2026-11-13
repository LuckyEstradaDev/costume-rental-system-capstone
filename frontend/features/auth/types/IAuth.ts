import type {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";
import type {Dispatch, SetStateAction} from "react";
import type {IUserLogin, IUser, IUserRegister} from "../types/IUser";

export interface IRegisterService {
  formData: IUserRegister;
  setError: Dispatch<SetStateAction<string>>;
}

export interface ILoginService {
  formData: IUserLogin;
  setAuthenticated: (value: boolean) => void;
  setUser: (user: IUser | null) => void;
  router: AppRouterInstance;
  setError: Dispatch<SetStateAction<string>>;
}

/** Response of POST /api/auth/login: an OTP challenge, never a session. */
export interface ILoginResponse {
  message: string;
  user?: {_id?: string};
  userId?: string;
  email?: string;
}
