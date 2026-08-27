import express from "express";
const router = express.Router();
import {
  createPaymentController,
  getAllPaymentsController,
  markPaymentRefundedController,
  updatePaymentController,
} from "../controllers/PaymentController.js";

router.post("/", createPaymentController);
router.patch("/", updatePaymentController);
router.get("/", getAllPaymentsController);
router.patch("/refund", markPaymentRefundedController);

export default router;
