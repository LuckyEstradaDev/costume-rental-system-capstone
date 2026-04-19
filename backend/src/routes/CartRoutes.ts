import express from "express";
import {
  addToCartController,
  getCartByUserIdController,
} from "../controllers/CartController.js";
const router = express.Router();

router.post("/", addToCartController);
router.get("/:userId", getCartByUserIdController);

export default router;
