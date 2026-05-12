import cron from "node-cron";
import {RentModel} from "../models/RentModel.js";

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

      // SEND NOTIFICATION HERE
    }
  } catch (error) {
    console.error(error);
  }
});
