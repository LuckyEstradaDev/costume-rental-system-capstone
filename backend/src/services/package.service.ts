import type {IPackage} from "../interfaces/IPackage.js";
import {PackageRepository} from "../repositories/PackageRepository.js";

const packageRepo = new PackageRepository();

const withTotals = async (packageItem: unknown) => {
  const packageData = packageItem as {
    items?: {
      rentalPackagePrice?: number | null;
      purchasePackagePrice?: number | null;
    }[];
  };
  const items = packageData.items ?? [];

  return {
    ...(packageItem as object),
    purchaseTotal: items.reduce(
      (total, item) => total + (item.purchasePackagePrice ?? 0),
      0,
    ),
    rentalTotal: items.reduce(
      (total, item) => total + (item.rentalPackagePrice ?? 0),
      0,
    ),
  };
};

export const createPackageService = async (data: IPackage) => {
  return withTotals((await packageRepo.createPackage(data)).toObject());
};

export const getAllPackagesService = async () => {
  const packages = await packageRepo.getAllPackages();
  return Promise.all(packages.map((item) => withTotals(item.toObject())));
};

export const getPackageByIdService = async (id: string) => {
  const item = await packageRepo.getPackageById(id);
  return item ? await withTotals(item.toObject()) : item;
};

export const updatePackageService = async (
  id: string,
  updateData: Partial<IPackage>,
) => {
  const item = await packageRepo.updatePackage(id, updateData);
  return item ? await withTotals(item.toObject()) : item;
};

export const deletePackageService = async (id: string) => {
  return packageRepo.deletePackage(id);
};
