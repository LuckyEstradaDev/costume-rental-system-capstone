import type {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";
import type {Dispatch, SetStateAction} from "react";
import type {IUserLogin, IUser} from "../types/IUser";

export interface IRegisterService {
  formData: IUser;
  router: AppRouterInstance;
  setError: Dispatch<SetStateAction<string>>;
}

export interface ILoginService {
  formData: IUserLogin;
  setAuthenticated: (value: boolean) => void;
  setUser: (user: IUser | null) => void;
  router: AppRouterInstance;
  setError: Dispatch<SetStateAction<string>>;
}
