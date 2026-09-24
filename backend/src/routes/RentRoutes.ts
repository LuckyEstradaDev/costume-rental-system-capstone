import express from "express";
import {
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
router.patch("/:id", authenticateToken, updateRentController);
router.post("/package", authenticateToken, createPackageRentController);

export default router;
