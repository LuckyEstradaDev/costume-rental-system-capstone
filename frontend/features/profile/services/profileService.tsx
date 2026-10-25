import {api} from "@/lib/axios";
import type {UserAddress} from "@/features/address/types";
import type {IUser} from "@/features/auth/types/IUser";

export type ProfileUpdatePayload = {
  firstName?: string;
  lastName?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  phoneNumber?: string;
  address?: UserAddress | null;
  profilePicture?: string | null;
};

export const updateProfileService = async (
  payload: ProfileUpdatePayload,
): Promise<IUser> => {
  const {data} = await api.patch<{message: string; user: IUser}>(
    "/api/auth/me",
    payload,
  );

  return data.user;
};
