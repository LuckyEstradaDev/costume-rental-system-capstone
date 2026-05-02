import express from "express";
import {
  getOrderOrRentById,
  getRentsAndOrdersByUserId,
} from "../controllers/UserController.js";

const router = express.Router();

router.get("/orders/details/:id", getOrderOrRentById);
router.get("/orders/:id", getRentsAndOrdersByUserId);

export default router;
