import express from "express";
import {confirmTestWalletPayment, Payment, webhookHandler} from "../controllers/PaymongoController.js";
import {authenticateToken} from "../middleware/authenticateToken.js";
const router = express.Router();

router.post("/intents/:orderId", authenticateToken, Payment);
router.post("/intents/:orderId/confirm-test-wallet", authenticateToken, confirmTestWalletPayment);
router.post("/webhook", webhookHandler);

export default router;
