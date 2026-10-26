import express from "express";
import {
  getAllRentsAndOrders,
  getOrderOrRentById,
  getRentsAndOrdersByUserId,
  updateOrderOrRentStatus,
} from "../controllers/UserController.js";
import {authenticateToken} from "../middleware/authenticateToken.js";

const router = express.Router();

router.get("/orders", getAllRentsAndOrders);
router.get("/orders/details/:id", authenticateToken, getOrderOrRentById);
router.patch(
  "/orders/details/:id/status",
  authenticateToken,
  updateOrderOrRentStatus,
);
router.get("/orders/:id", getRentsAndOrdersByUserId);

export default router;
