import express from "express";
import {
  createOutfitController,
  deleteOutfitController,
  getOutfitByIdController,
  getOutfitsController,
  updateOutfitController,
} from "../controllers/OutfitController.js";
import {authenticateToken} from "../middleware/authenticateToken.js";
const router = express.Router();

router.post("/", authenticateToken, createOutfitController);
router.get("/", authenticateToken, getOutfitsController);
router.get("/:id", getOutfitByIdController);
router.patch("/:id", authenticateToken, updateOutfitController);
router.delete("/:id", authenticateToken, deleteOutfitController);

export default router;
