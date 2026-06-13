import type {Request, Response} from "express";
import {
  addToCartService,
  getCartByUserIdService,
  removeFromCartService,
} from "../services/cart.service.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";

export const addToCartController = async (req: Request, res: Response) => {
  try {
    await addToCartService(req.body);
    res.status(200).json({message: "Items added to cart"});
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to add item to cart.");
  }
};

export const getCartByUserIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const {userId} = req.params as {userId: string};
    const cart = await getCartByUserIdService(userId);
    res.status(200).json(cart);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch cart.");
  }
};

export const removeFromCartController = async (req: Request, res: Response) => {
  try {
    const {userId, variantId, size} = req.params as {
      userId: string;
      variantId: string;
      size: string;
    };
    await removeFromCartService(userId, variantId, size);
    res.status(200).json({message: "Item removed from cart"});
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to remove item from cart.");
  }
};
