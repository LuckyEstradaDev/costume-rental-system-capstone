import express from "express";
import {
  createBundleController,
  deleteBundleController,
  getAllBundlesController,
  getBundleByIdController,
  updateBundleController,
} from "../controllers/BundleController.js";
import {authenticateToken} from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/", authenticateToken, createBundleController);
router.get("/", getAllBundlesController);
router.get("/:id", getBundleByIdController);
router.patch("/:id", authenticateToken, updateBundleController);
router.delete("/:id", authenticateToken, deleteBundleController);

export default router;
