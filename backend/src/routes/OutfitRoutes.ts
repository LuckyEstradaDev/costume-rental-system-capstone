import express from "express";
import {
  createOutfitController,
  deleteOutfitController,
  getOutfitsController,
  updateOutfitController,
} from "../controllers/OutfitController.js";
import multer from "multer";
import {authenticateToken} from "../middleware/authenticateToken.js";
const router = express.Router();
const upload = multer({dest: "uploads/"});

router.post(
  "/",
  authenticateToken,
  upload.single("image"),
  createOutfitController,
);
router.get("/", authenticateToken, getOutfitsController);
router.patch("/:id", authenticateToken, updateOutfitController);
router.delete("/:id", authenticateToken, deleteOutfitController);

export default router;
