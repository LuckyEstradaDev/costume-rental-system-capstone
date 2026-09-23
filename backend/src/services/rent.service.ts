import {Types} from "mongoose";
import type {IPackageCart} from "../interfaces/IPackageCart.js";
import type {IPayment} from "../interfaces/IPayment.js";
import type {IRent} from "../interfaces/IRent.js";
import type {Snapshot} from "../interfaces/ISnapshot.js";
import {RentRepository} from "../repositories/RentRepository.js";

let rentRepo = new RentRepository();

export const createRentService = async (data: IRent, paymentData: IPayment) => {
  return rentRepo.createRent(data, paymentData);
};

export const getAllRentsService = async () => {
  return rentRepo.getAllRents();
};

export const getRentsByUserID = async (id: string) => {
  return rentRepo.getRentByUserId(id);
};

export const updateRentByID = async (
  id: string,
  updateData: Partial<IRent>,
) => {
  return rentRepo.updateRent(id, updateData);
};

export const packageRentService = (
  packageData: IPackageCart,
  paymentData: IPayment,
  rentalDays: number
) => {
  //flatten
  const items: Snapshot[] = packageData.packageItems.flatMap(
    (item) => item.items,
  );
  //total amount

  const totalAmount = packageData.packageItems.reduce((total, packageItem) => {
    const packageTotal =
      packageItem.mode === "rental"
        ? packageItem.rentalTotal
        : packageItem.purchaseTotal;

    return total + (packageTotal ?? 0);
  }, 0);
  //build rent

  const rentData: IRent = {
    userID: new Types.ObjectId(packageData.userId),
    type: "rent",
    items,
    isPackage: true,
    totalAmount,
    status: "pending",
    rentalDays: rentalDays
  };
  //itemPackageIDS

  const purchasedPackageIds = packageData.packageItems.map(
    (packageItem) => packageItem.packageId,
  );

  //call rent repo
  const rent = rentRepo.createPackageRent(rentData, items, packageData, paymentData, purchasedPackageIds)
  //return rent

  return rent;
};
