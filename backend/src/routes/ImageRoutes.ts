import express from "express";
import multer from "multer";
import {
  ImageController,
  ModelController,
} from "../controllers/ImageController.js";
import {authenticateToken} from "../middleware/authenticateToken.js";
const router = express.Router();

const upload = multer({storage: multer.memoryStorage()});

router.post(
  "/upload",
  authenticateToken,
  upload.single("image"),
  ImageController,
);

router.post(
  "/upload-model",
  authenticateToken,
  upload.single("model"),
  ModelController,
);

export default router;
