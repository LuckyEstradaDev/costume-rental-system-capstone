import type {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";
import type {Dispatch, SetStateAction} from "react";
import type {IUserRegistration} from "../types/IUser";

export interface IRegisterService {
  formData: IUserRegistration;
  router: AppRouterInstance;
  setError: Dispatch<SetStateAction<string>>;
}
