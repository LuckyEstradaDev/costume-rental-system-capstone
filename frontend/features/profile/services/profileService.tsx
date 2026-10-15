import {api} from "@/lib/axios";
import type {UserAddress} from "@/features/address/types";
import type {IUser} from "@/features/auth/types/IUser";

export const updateProfileService = async (
  address: UserAddress | null,
): Promise<IUser> => {
  const {data} = await api.patch<{message: string; user: IUser}>(
    "/api/auth/me",
    {address},
  );

  return data.user;
};
