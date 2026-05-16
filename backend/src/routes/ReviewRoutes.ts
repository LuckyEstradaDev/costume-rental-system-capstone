import express from "express";
import {
  addReviewController,
  getReviewsByOutfitIdController,
} from "../controllers/ReviewController.js";
const router = express.Router();

router.post("/", addReviewController);
router.post("", addReviewController);
router.get("/:outfitID", getReviewsByOutfitIdController);

//FOR TESTING POSTMAN

export default router;
