import {api} from "@/lib/axios";
import type {IPackageCart} from "../types/IPackageCart";

export const fetchPackageCartService = async (
  id: string,
): Promise<IPackageCart> => {
  const res = await api.get<IPackageCart>(`/api/package-cart/${id}`);

  return res.data;
};

export const addToPackageCartService = async (data: IPackageCart) => {
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