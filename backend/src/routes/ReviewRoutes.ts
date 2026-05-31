import express from "express";
import {
  addReviewController,
  deleteReviewController,
  getAllReviewsController,
  getReviewsByOutfitIdController,
  getReviewsByUserIdController,
  updateReviewController,
} from "../controllers/ReviewController.js";
const router = express.Router();

router.post("/", addReviewController);
router.post("", addReviewController);
router.get("/", getAllReviewsController);
router.get("/user/:userID", getReviewsByUserIdController);
router.put("/:reviewID", updateReviewController);
router.get("/:outfitID", getReviewsByOutfitIdController);
router.delete("/:reviewID", deleteReviewController);

//FOR TESTING POSTMAN

export default router;
