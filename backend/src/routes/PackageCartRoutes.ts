import express from "express";
import {
  addToPackageCartController,
  getPackageCartByUserIdController,
  removeFromPackageCartController,
} from "../controllers/PackageCartController.js";
const router = express.Router();

router.post("/", addToPackageCartController);
router.get("/:userId", getPackageCartByUserIdController);
router.delete("/:userId/item/:packageId", removeFromPackageCartController);

export default router;
