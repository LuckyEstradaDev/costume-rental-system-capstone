import express from "express";
const router = express.Router();
import {
  createPaymentController,
  getAllPaymentsController,
  markPaymentRefundedController,
  updatePaymentController,
} from "../controllers/PaymentController.js";
import {authenticateToken} from "../middleware/authenticateToken.js";

router.post("/", createPaymentController);
router.patch("/", authenticateToken, updatePaymentController);
router.get("/", authenticateToken, getAllPaymentsController);
router.patch("/refund", authenticateToken, markPaymentRefundedController);

export default router;
