import express from "express";
import {
  getAllRentsAndOrders,
  getOrderOrRentById,
  getRentsAndOrdersByUserId,
  updateOrderOrRentStatus,
} from "../controllers/UserController.js";

const router = express.Router();

router.get("/orders", getAllRentsAndOrders);
router.get("/orders/details/:id", getOrderOrRentById);
router.patch("/orders/details/:id/status", updateOrderOrRentStatus);
router.get("/orders/:id", getRentsAndOrdersByUserId);

export default router;
