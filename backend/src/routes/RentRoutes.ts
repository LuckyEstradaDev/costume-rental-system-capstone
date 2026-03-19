import express from "express";
import {
  createRentController,
  getAllRentsController,
  getRentsByUserController,
  updateRentController,
} from "../controllers/RentController.js";
import {authenticateToken} from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/", createRentController);
router.get("/", getAllRentsController);
router.get("/user", authenticateToken, getRentsByUserController);
router.patch("/:id", updateRentController);

export default router;
