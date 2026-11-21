import cron from "node-cron";
import app, {databaseConnection} from "./app.js";
import {expireUnpaidReservations} from "./services/reservation.service.js";

const startServer = async () => {
  try {
    await databaseConnection;
    await expireUnpaidReservations();
    cron.schedule("*/5 * * * *", () => {
      void expireUnpaidReservations().catch((error) => {
        console.error("Failed to expire unpaid reservations:", error);
      });
    });
    const port = Number(process.env.PORT) || 5000;

    app.listen(port, () => {
      console.log("Listening");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
