import type {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";
import type {Dispatch, SetStateAction} from "react";
import type {IUserLogin, IUserRegistration} from "../types/IUser";

export interface IRegisterService {
  formData: IUserRegistration;
  router: AppRouterInstance;
  setError: Dispatch<SetStateAction<string>>;
}

export interface ILoginService {
  formData: IUserLogin;
  setAuthenticated: (value: boolean) => void;
  setUser: (user: IUserRegistration | null) => void;
  router: AppRouterInstance;
  setError: Dispatch<SetStateAction<string>>;
}
