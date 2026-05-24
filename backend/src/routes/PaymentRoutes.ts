import express from "express";
const router = express.Router();
import {
  createPaymentController,
  updatePaymentController,
} from "../controllers/PaymentController.js";

router.post("/", createPaymentController);
router.patch("/", updatePaymentController);

export default router;
