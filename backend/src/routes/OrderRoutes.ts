import {
  createOrderController,
  createPackageOrderController,
  getAllOrdersController,
  getOrdersByUserIdController,
} from "../controllers/OrderController.js";
import express from "express";
import {authenticateToken} from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/create", authenticateToken, createOrderController);
router.post("/package", authenticateToken, createPackageOrderController);
router.get("/", authenticateToken, getAllOrdersController);
router.get("/user/:userId", authenticateToken, getOrdersByUserIdController);

export default router;
