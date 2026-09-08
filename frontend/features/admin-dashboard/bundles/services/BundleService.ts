import {api} from "@/lib/axios";
import {IBundle} from "../types/IBundle";

export const fetchBundlesService = async (): Promise<IBundle[]> => {
  try {
    const res = await api.get<IBundle[]>("/api/bundles");
    return res.data;
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return [];
  }
};

export const fetchBundleById = async (bundleId: string): Promise<IBundle> => {
  const res = await api.get<IBundle>(`/api/bundles/${bundleId}`);
  return res.data;
};

export const createBundleService = async (
  bundle: IBundle,
): Promise<IBundle> => {
  try {
    const res = await api.post<IBundle>("/api/bundles", bundle);
    return res.data;
  } catch (error) {
    console.error("Error creating bundle:", error);
    throw error;
  }
};

export const updateBundleService = async ({
  bundleId,
  updateData,
}: {
  bundleId: string;
  updateData: Partial<IBundle>;
}): Promise<IBundle> => {
  const res = await api.patch<IBundle>(`/api/bundles/${bundleId}`, updateData);
  return res.data;
};

export const deleteBundleService = async (
  bundleId: string,
): Promise<IBundle> => {
  const res = await api.delete<IBundle>(`/api/bundles/${bundleId}`);
  return res.data;
};
