import express from "express";
import {
  checkOverdueRentalsController,
  createPackageRentController,
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
router.post("/check-overdue", authenticateToken, checkOverdueRentalsController);
router.patch("/:id", authenticateToken, updateRentController);
router.post("/package", authenticateToken, createPackageRentController);

export default router;
