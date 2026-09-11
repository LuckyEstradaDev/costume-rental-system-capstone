import type {IBundle} from "../interfaces/IBundle.js";
import {BundleRepository} from "../repositories/BundleRepository.js";

const bundleRepo = new BundleRepository();

const withTotals = (bundle: unknown) => {
  const packageData = bundle as {
    items?: Array<{
      purchasePackagePrice?: number | null;
      rentalPackagePrice?: number | null;
    }>;
  };

  return {
    ...(bundle as object),
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

export const createBundleService = async (data: IBundle) => {
  return withTotals(await bundleRepo.createBundle(data));
};

export const getAllBundlesService = async () => {
  const bundles = await bundleRepo.getAllBundles();
  return bundles.map((bundle) => withTotals(bundle.toObject()));
};

export const getBundleByIdService = async (id: string) => {
  const bundle = await bundleRepo.getBundleById(id);
  return bundle ? withTotals(bundle.toObject()) : bundle;
};

export const updateBundleService = async (
  id: string,
  updateData: Partial<IBundle>,
) => {
  const bundle = await bundleRepo.updateBundle(id, updateData);
  return bundle ? withTotals(bundle.toObject()) : bundle;
};

export const deleteBundleService = async (id: string) => {
  return bundleRepo.deleteBundle(id);
};
