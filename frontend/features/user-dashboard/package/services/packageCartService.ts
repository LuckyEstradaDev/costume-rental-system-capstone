import {api} from "@/lib/axios";
import {IPackageCartItem} from "../types/IPackageCart";

export const fetchPackageCartService = async (
  id: string,
): Promise<IPackageCartItem> => {
  console.log("HELLO");
  const res = await api.get<IPackageCartItem>(`/api/package-cart/${id}`);

  return res.data;
};

export const addToPackageCartService = async (data: IPackageCartItem) => {
  return api.post("/api/package-cart/", data);
};

export const removeFromPackageCartService = async ({
  userId,
  packageId,
}: {
  userId: string;
  packageId: string;
}) => {
  return api.delete(`/api/package-cart/${userId}/item/${packageId}`);
};
