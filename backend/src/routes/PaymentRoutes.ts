import express from "express";
const router = express.Router();
import {
  createPaymentController,
  getAllPaymentsController,
  updatePaymentController,
} from "../controllers/PaymentController.js";

router.post("/", createPaymentController);
router.patch("/", updatePaymentController);
router.get("/", getAllPaymentsController);

export default router;
