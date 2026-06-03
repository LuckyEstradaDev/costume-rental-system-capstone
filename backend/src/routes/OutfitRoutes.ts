import express from "express";
import {
  createOutfitController,
  deleteOutfitController,
  getOutfitByIdController,
  getOutfitsController,
  getOutfitStatsController,
  updateOutfitController,
} from "../controllers/OutfitController.js";
import {authenticateToken} from "../middleware/authenticateToken.js";
const router = express.Router();

router.post("/", authenticateToken, createOutfitController);
router.get("/", authenticateToken, getOutfitsController);
router.get("/stats", authenticateToken, getOutfitStatsController);
router.get("/:id", authenticateToken, getOutfitByIdController);
router.patch("/:id", authenticateToken, updateOutfitController);
router.delete("/:id", authenticateToken, deleteOutfitController);

export default router;
