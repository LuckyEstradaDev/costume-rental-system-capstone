import {
  createOrderController,
  getAllOrdersController,
  getOrdersByUserIdController,
} from "../controllers/OrderController.js";
import express from "express";

const router = express.Router();

router.post("/create", createOrderController);
router.get("/", getAllOrdersController);
router.get("/user/:userId", getOrdersByUserIdController);

export default router;
