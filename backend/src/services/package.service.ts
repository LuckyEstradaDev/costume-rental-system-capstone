import type {IPackage} from "../interfaces/IPackage.js";
import {PackageRepository} from "../repositories/PackageRepository.js";

const packageRepo = new PackageRepository();

const withTotals = (packageItem: unknown) => {
  const packageData = packageItem as {
    items?: Array<{
      purchasePackagePrice?: number | null;
      rentalPackagePrice?: number | null;
    }>;
  };

  return {
    ...(packageItem as object),
    purchaseTotal: (packageData.items ?? []).reduce(
      (total, outfit) => total + (outfit.purchasePackagePrice ?? 0),
      0,
    ),
    rentalTotal: (packageData.items ?? []).reduce(
      (total, outfit) => total + (outfit.rentalPackagePrice ?? 0),
      0,
    ),
  };
};

export const createPackageService = async (data: IPackage) => {
  return withTotals(await packageRepo.createPackage(data));
};

export const getAllPackagesService = async () => {
  const packages = await packageRepo.getAllPackages();
  return packages.map((item) => withTotals(item.toObject()));
};

export const getPackageByIdService = async (id: string) => {
  const item = await packageRepo.getPackageById(id);
  return item ? withTotals(item.toObject()) : item;
};

export const updatePackageService = async (
  id: string,
  updateData: Partial<IPackage>,
) => {
  const item = await packageRepo.updatePackage(id, updateData);
  return item ? withTotals(item.toObject()) : item;
};

export const deletePackageService = async (id: string) => {
  return packageRepo.deletePackage(id);
};
