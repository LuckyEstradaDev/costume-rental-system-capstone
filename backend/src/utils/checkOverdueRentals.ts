import cron from "node-cron";
import {RentModel} from "../models/RentModel.js";
import {NotificationRepository} from "../repositories/NotificationRepository.js";
import {notificationBuilder} from "./notificationBuilder.js";

const notifRepo = new NotificationRepository();

cron.schedule("*/5 * * * *", async () => {
  try {
    console.log("Checking overdue rentals...");

    const now = new Date();

    const overdueRents = await RentModel.find({
      status: "active",
      duedate: {
        $lt: now,
      },
    });

    for (const rent of overdueRents) {
      rent.status = "overdue";

      await rent.save();

      console.log(`Rent ${rent._id} marked overdue`);

      notifRepo.create(
        rent.userID.toString(),
        notificationBuilder(
          "overdue-rent",
          rent.referenceID,
          rent._id.toString(),
        ),
      );
    }

    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    const nearOverdueRents = await RentModel.find({
      status: "active",
      duedate: {
        $gte: now,
        $lte: oneDayFromNow,
      },
    });

    for (const rent of nearOverdueRents) {
      console.log(`Rent ${rent._id} is near overdue`);
      notifRepo.create(
        rent.userID.toString(),
        notificationBuilder(
          "near-overdue-rent",
          rent.referenceID,
          rent._id.toString(),
        ),
      );
    }
  } catch (error) {
    console.error(error);
  }
});
