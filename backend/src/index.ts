import app from "./app.js";
import {connectDB} from "./config/db.js";

const startServer = async () => {
  try {
    await connectDB();

    app.listen(5000, () => {
      console.log("Listening");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
