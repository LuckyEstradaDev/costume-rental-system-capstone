import app from "./app.js";
import {connectDB} from "./config/db.js";

const startServer = async () => {
  try {
    await connectDB();
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
