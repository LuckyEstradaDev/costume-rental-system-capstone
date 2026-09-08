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
