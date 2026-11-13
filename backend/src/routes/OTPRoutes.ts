
import express from "express";
import {authenticateToken} from "../middleware/authenticateToken.js";
import { verifyOTPController } from "../controllers/OTPController.js";

const router = express.Router();

router.post("/verify", verifyOTPController);

export default router;
