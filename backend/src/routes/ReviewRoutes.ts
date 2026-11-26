import express from "express";
import {authenticateToken} from "../middleware/authenticateToken.js";
import {requireAccountRole} from "../middleware/requireAccountRole.js";
import {
  addReviewController,
  moderateReviewController,
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
router.get("/moderation", authenticateToken, requireAccountRole("admin", "staff"), getAllReviewsController);
router.patch("/:reviewID/moderation", authenticateToken, requireAccountRole("admin", "staff"), moderateReviewController);
router.get("/user/:userID", authenticateToken, getReviewsByUserIdController);
router.put("/:reviewID", updateReviewController);
router.get("/:outfitID", getReviewsByOutfitIdController);
router.delete("/:reviewID", deleteReviewController);

//FOR TESTING POSTMAN

export default router;
