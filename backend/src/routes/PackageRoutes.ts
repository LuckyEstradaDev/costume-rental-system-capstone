import express from "express";
import {
  createPackageController,
  deletePackageController,
  getAllPackagesController,
  getPackageByIdController,
  updatePackageController,
} from "../controllers/PackageController.js";
import {authenticateToken} from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/", authenticateToken, createPackageController);
router.get("/", getAllPackagesController);
router.get("/:id", getPackageByIdController);
router.patch("/:id", authenticateToken, updatePackageController);
router.delete("/:id", authenticateToken, deletePackageController);

export default router;
