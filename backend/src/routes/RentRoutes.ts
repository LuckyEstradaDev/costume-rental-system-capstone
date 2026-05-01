import express from "express";
import {
  createRentController,
  getAllRentsController,
  getRentsByUserController,
  updateRentController,
} from "../controllers/RentController.js";
import {authenticateToken} from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/", authenticateToken, createRentController);
router.get("/", authenticateToken, getAllRentsController);
router.get("/user", authenticateToken, getRentsByUserController);
router.patch("/:id", authenticateToken, updateRentController);

export default router;
