import type {IPackageCart} from "../interfaces/IPackageCart.js";
import {PackageCartRepository} from "../repositories/PackageCartRepository.js";

let packageCartRepository = new PackageCartRepository();

export const addToPackageCartService = async (data: IPackageCart) => {
  const cart = await packageCartRepository.getByUserId(data.userId);
  const itemToAdd = data.packageItems[0];

  if (cart) {
    const itemExists = cart.packageItems.some(
      (item) => item.packageId === itemToAdd!.packageId,
    );

    if (itemExists) {
      throw new Error("This package is already in your cart.");
    }

    return await packageCartRepository.update(data);
  }

  return await packageCartRepository.create(data);
};

export const getPackageCartByUserIdService = async (userId: string) => {
  return await packageCartRepository.getByUserId(userId);
};

export const removeFromPackageCartService = async (
  userId: string,
  packageId: string,
) => {
  return await packageCartRepository.deleteItem(userId, packageId);
};