import {api} from "@/lib/axios";
import {IPackage} from "../types/IPackage";

export const fetchPackagesService = async (): Promise<IPackage[]> => {
  try {
    const res = await api.get<IPackage[]>("/api/packages");
    return res.data;
  } catch (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
};

export const fetchPackageById = async (packageId: string): Promise<IPackage> => {
  const res = await api.get<IPackage>(`/api/packages/${packageId}`);
  return res.data;
};

export const createPackageService = async (
  packageData: IPackage,
): Promise<IPackage> => {
  try {
    const res = await api.post<IPackage>("/api/packages", packageData);
    return res.data;
  } catch (error) {
    console.error("Error creating package:", error);
    throw error;
  }
};

export const updatePackageService = async ({
  packageId,
  updateData,
}: {
  packageId: string;
  updateData: Partial<IPackage>;
}): Promise<IPackage> => {
  const res = await api.patch<IPackage>(`/api/packages/${packageId}`, updateData);
  return res.data;
};

export const deletePackageService = async (
  packageId: string,
): Promise<IPackage> => {
  const res = await api.delete<IPackage>(`/api/packages/${packageId}`);
  return res.data;
};
