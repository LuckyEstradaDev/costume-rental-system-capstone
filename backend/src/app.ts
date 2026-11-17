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
import OrderRoutes from "./routes/OrderRoutes.js";
import RentRoutes from "./routes/RentRoutes.js";
import UserRoutes from "./routes/UserRoutes.js";
import ReviewRoutes from "./routes/ReviewRoutes.js";
import AdminRoutes from "./routes/AdminRoutes.js";
import PaymentRoutes from "./routes/PaymentRoutes.js";
import PackageRoutes from "./routes/PackageRoutes.js";
import PackageCartRoutes from "./routes/PackageCartRoutes.js";
import PaymongoRoutes from "./routes/PaymongoRoutes.js";
import OTPRoutes from "./routes/OTPRoutes.js";
const app = express();

export const databaseConnection = connectDB();

const configuredOrigin = process.env.CLIENT_URL;

/**
 * Requests from the app's own origin are always allowed. During development we
 * also allow loopback and private LAN origins, because the dev server can move
 * ports and is often opened from another device (e.g. a phone), which would
 * otherwise be rejected by CORS and leave the browse page with no data.
 */
const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true; // same-origin, curl, server-to-server
  if (configuredOrigin && origin === configuredOrigin) return true;
  if (process.env.NODE_ENV === "production") return false;

  try {
    const {protocol, hostname} = new URL(origin);
    if (protocol !== "http:" && protocol !== "https:") return false;
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      /^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
    );
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    credentials: true, // allow cookies
  }),
);
app.use(cookieParser());
app.use(
  "/api/paymongo",
  express.raw({type: "application/json"}),
  PaymongoRoutes,
);

app.get("/", (req: Request, res: Response) => {
  res.send("server is running;");
});

app.use(express.json());
app.use("/api/auth", AuthRoutes);
app.use("/api/otp", OTPRoutes);
app.use("/api/outfits", OutfitRoutes);
app.use("/api/cloudinary", ImageRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/orders", OrderRoutes);
app.use("/api/rents", RentRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/reviews", ReviewRoutes);
app.use("/api/review", ReviewRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/payment", PaymentRoutes);
app.use("/api/packages", PackageRoutes);
app.use("/api/package-cart", PackageCartRoutes);

export default app;
