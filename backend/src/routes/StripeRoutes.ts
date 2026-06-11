import express from "express";
import {
  createCheckoutSessionController,
  stripeWebhookController,
} from "../controllers/StripeControllers.js";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSessionController);
router.post(
  "/webhook",
  express.raw({type: "application/json"}),
  stripeWebhookController,
);

export default router;
