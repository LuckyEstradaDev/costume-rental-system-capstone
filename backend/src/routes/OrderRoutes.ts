import {
  createOrderController,
  getOrdersByUserIdController,
} from "../controllers/OrderController.js";
import express from "express";

const router = express.Router();

router.post("/create", createOrderController);
router.get("/user/:userId", getOrdersByUserIdController);

export default router;
