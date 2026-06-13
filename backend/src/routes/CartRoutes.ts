import express from "express";
import {
  addToCartController,
  getCartByUserIdController,
  removeFromCartController,
} from "../controllers/CartController.js";
const router = express.Router();

router.post("/", addToCartController);
router.get("/:userId", getCartByUserIdController);
router.delete("/:userId/item/:variantId/:size", removeFromCartController);

export default router;
