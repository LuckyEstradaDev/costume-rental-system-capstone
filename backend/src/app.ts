import "./config/dotenvconfig.js";
import "dotenv/config";
import express, {type Request, type Response} from "express";
import AuthRoutes from "./routes/AuthRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import OutfitRoutes from "./routes/OutfitRoutes.js";
import ImageRoutes from "./routes/ImageRoutes.js";
import {connectDB} from "./config/db.js";
import CartRoutes from "./routes/CartRoutes.js";
const app = express();

connectDB();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // allow cookies
  }),
);
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("server is running;");
});

app.use("/api/auth", AuthRoutes);
app.use("/api/outfits", OutfitRoutes);
app.use("/api/cloudinary", ImageRoutes);
app.use("/api/cart", CartRoutes);

export default app;
