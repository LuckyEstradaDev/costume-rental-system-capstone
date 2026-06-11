import express from "express";
import {stripeWebhookController} from "../controllers/StripeControllers.js";

const router = express.Router();

router.post(
  "/webhook",
  express.raw({type: "application/json"}),
  stripeWebhookController,
);

export default router;
