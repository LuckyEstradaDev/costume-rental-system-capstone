import express from "express";
import multer from "multer";
import {ImageController} from "../controllers/ImageController.js";
import {authenticateToken} from "../middleware/authenticateToken.js";
const router = express.Router();

const upload = multer({dest: "uploads/"});

router.post(
  "/upload",
  authenticateToken,
  upload.single("image"),
  ImageController,
);

export default router;
