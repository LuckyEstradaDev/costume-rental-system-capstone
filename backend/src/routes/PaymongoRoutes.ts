import express from "express";
import {Payment, webhookHandler} from "../controllers/PaymongoController.js";
import {authenticateToken} from "../middleware/authenticateToken.js";
const router = express.Router();

router.post("/intents/:orderId", authenticateToken, Payment);
router.post("/webhook", webhookHandler);

export default router;
