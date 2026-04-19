import type {Request, Response} from "express";
import {
  addToCartService,
  getCartByUserIdService,
} from "../services/cart.service.js";

export const addToCartController = async (req: Request, res: Response) => {
  try {
    const {userId, items} = req.body;
    await addToCartService(userId, items);
    res.status(200).json({message: "Items added to cart"});
  } catch (error) {
    res.status(500).json({message: "Error adding product to cart"});
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
