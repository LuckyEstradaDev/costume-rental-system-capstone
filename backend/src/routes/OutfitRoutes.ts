import express from "express";
import {
  createOutfitController,
  deleteOutfitController,
  getOutfitByIdController,
  getOutfitsController,
  getOutfitSoldCountController,
  getOutfitRentedCountController,
  getOutfitStatsController,
  updateOutfitController,
} from "../controllers/OutfitController.js";
import {authenticateToken} from "../middleware/authenticateToken.js";
const router = express.Router();

router.post("/", authenticateToken, createOutfitController);
router.get("/", getOutfitsController);
router.get("/stats", authenticateToken, getOutfitStatsController);
router.get("/:id/sold", getOutfitSoldCountController);
router.get("/:id/rented", getOutfitRentedCountController);
router.get("/:id", getOutfitByIdController);
router.patch("/:id", authenticateToken, updateOutfitController);
router.delete("/:id", authenticateToken, deleteOutfitController);

export default router;
