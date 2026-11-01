import {Types} from "mongoose";
import type {IPackageCart} from "../interfaces/IPackageCart.js";
import type {IPayment} from "../interfaces/IPayment.js";
import type {IRent} from "../interfaces/IRent.js";
import type {Snapshot} from "../interfaces/ISnapshot.js";
import type {IUserAddressInterface} from "../interfaces/IUser.js";
import {RentRepository} from "../repositories/RentRepository.js";
import {NotificationRepository} from "../repositories/NotificationRepository.js";
import {notificationBuilder} from "../utils/notificationBuilder.js";

let rentRepo = new RentRepository();
const notifRepo = new NotificationRepository();

// Customers pick an event date; the outfit is due back this many days after it.
export const RENTAL_RETURN_WINDOW_DAYS = 5;

const computeDueDate = (eventDate?: Date, rentalDays?: number) => {
  if (!eventDate) {
    return undefined;
  }

  const dueDate = new Date(eventDate);
  dueDate.setDate(
    dueDate.getDate() + (rentalDays ?? RENTAL_RETURN_WINDOW_DAYS),
  );

  return dueDate;
};

export const createRentService = async (data: IRent, paymentData: IPayment) => {
  const rentalDays = data.rentalDays ?? RENTAL_RETURN_WINDOW_DAYS;
  const dueDate = data.duedate ?? computeDueDate(data.eventDate, rentalDays);

  const rentData: IRent = {
    ...data,
    rentalDays,
    ...(dueDate ? {duedate: dueDate} : {}),
  };

  return rentRepo.createRent(rentData, paymentData);
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
  return rentRepo.findByIdAndUpdate(id, updateData);
};

export const packageRentService = (
  packageData: IPackageCart,
  paymentData: IPayment,
  rentalDays: number,
  eventDate?: Date,
  address?: IUserAddressInterface,
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

  const dueDate = computeDueDate(eventDate, rentalDays);

  const rentData: IRent = {
    userID: new Types.ObjectId(packageData.userId),
    type: "rent",
    items,
    isPackage: true,
    totalAmount,
    status: "pending",
    rentalDays: rentalDays ?? RENTAL_RETURN_WINDOW_DAYS,
    ...(eventDate ? {eventDate} : {}),
    ...(dueDate ? {duedate: dueDate} : {}),
    ...(address ? {address} : {}),
  };
  //itemPackageIDS

  const purchasedPackageIds = packageData.packageItems.map(
    (packageItem) => packageItem.packageId,
  );

  //call rent repo
  const rent = rentRepo.createPackageRent(
    rentData,
    items,
    packageData,
    paymentData,
    purchasedPackageIds,
  );

  return rent;
};

export interface OverdueCheckScope {
  userID?: string;
}

export interface OverdueCheckResult {
  overdueMarked: number;
  overdueNotifications: number;
  nearOverdueNotifications: number;
}

export const checkOverdueRentalsService = async (
  scope: OverdueCheckScope = {},
): Promise<OverdueCheckResult> => {
  console.log("Checking overdue rentals...");

  const overdueMarked = await rentRepo.markPastDueActiveRentsOverdue(scope);

  let overdueNotifications = 0;
  const unnotifiedOverdue = await rentRepo.findUnnotifiedOverdueRents(scope);

  for (const rent of unnotifiedOverdue) {
    if (!rent._id) continue;

    // Atomic claim so concurrent logins can never double-notify.
    const claimed = await rentRepo.claimOverdueNotification(
      rent._id.toString(),
    );
    if (!claimed) continue;

    try {
      await notifRepo.create(
        rent.userID.toString(),
        notificationBuilder(
          "overdue-rent",
          rent.referenceID,
          rent._id.toString(),
        ),
      );
      overdueNotifications++;
    } catch (error) {
      // Release the flag so the notification retries on the next check.
      await rentRepo.releaseOverdueNotification(rent._id.toString());
      console.error(
        `Failed to send overdue notification for rent ${rent._id}:`,
        error,
      );
    }
  }

  let nearOverdueNotifications = 0;
  const unnotifiedNearOverdue =
    await rentRepo.findUnnotifiedNearOverdueRents(scope);

  for (const rent of unnotifiedNearOverdue) {
    if (!rent._id) continue;

    const claimed = await rentRepo.claimNearOverdueNotification(
      rent._id.toString(),
    );
    if (!claimed) continue;

    try {
      await notifRepo.create(
        rent.userID.toString(),
        notificationBuilder(
          "near-overdue-rent",
          rent.referenceID,
          rent._id.toString(),
        ),
      );
      nearOverdueNotifications++;
    } catch (error) {
      await rentRepo.releaseNearOverdueNotification(rent._id.toString());
      console.error(
        `Failed to send near-overdue notification for rent ${rent._id}:`,
        error,
      );
    }
  }

  return {overdueMarked, overdueNotifications, nearOverdueNotifications};
};
