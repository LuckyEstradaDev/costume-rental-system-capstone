import express from "express";
import {
  addReviewController,
  getReviewsByOutfitIdController,
  getReviewsByUserIdController,
  updateReviewController,
} from "../controllers/ReviewController.js";
const router = express.Router();

router.post("/", addReviewController);
router.post("", addReviewController);
router.get("/user/:userID", getReviewsByUserIdController);
router.put("/:reviewID", updateReviewController);
router.get("/:outfitID", getReviewsByOutfitIdController);

//FOR TESTING POSTMAN

export default router;
