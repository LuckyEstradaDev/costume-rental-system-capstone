import express from "express";
import {
  createOutfitController,
  deleteOutfitController,
  getOutfitsController,
  updateOutfitController,
} from "../controllers/OutfitController.js";
const router = express.Router();

router.post("/", createOutfitController);
router.get("/", getOutfitsController);
router.patch("/:id", updateOutfitController);
router.delete("/:id", deleteOutfitController);

export default router;
