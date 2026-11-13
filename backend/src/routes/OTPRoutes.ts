
import express from "express";
import { resendOTPController, verifyOTPController } from "../controllers/OTPController.js";

const router = express.Router();

router.post("/verify", verifyOTPController);
router.post("/resend", resendOTPController);

export default router;
