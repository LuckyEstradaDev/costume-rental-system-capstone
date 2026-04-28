import type {Request, Response} from "express";
import {
  addToCartService,
  getCartByUserIdService,
  removeFromCartService,
} from "../services/cart.service.js";

export const addToCartController = async (req: Request, res: Response) => {
  try {
    await addToCartService(req.body);
    res.status(200).json({message: "Items added to cart"});
  } catch (error: any) {
    res
      .status(500)
      .json({message: "Error adding product to cart: " + error.message});
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
    res.status(500).json({message: "Error fetching cart"});
  }
};

export const removeFromCartController = async (req: Request, res: Response) => {
  try {
    const {userId, outfitId} = req.params as {userId: string; outfitId: string};
    await removeFromCartService(userId, outfitId);
    res.status(200).json({message: "Item removed from cart"});
  } catch (error) {
    res.status(500).json({message: "Error removing item from cart"});
  }
};
