import type {IBundle} from "../interfaces/IBundle.js";
import {BundleRepository} from "../repositories/BundleRepository.js";

const bundleRepo = new BundleRepository();

export const createBundleService = async (data: IBundle) => {
  return bundleRepo.createBundle(data);
};

export const getAllBundlesService = async () => {
  return bundleRepo.getAllBundles();
};

export const getBundleByIdService = async (id: string) => {
  return bundleRepo.getBundleById(id);
};

export const updateBundleService = async (
  id: string,
  updateData: Partial<IBundle>,
) => {
  return bundleRepo.updateBundle(id, updateData);
};

export const deleteBundleService = async (id: string) => {
  return bundleRepo.deleteBundle(id);
};
