import type {Request, Response} from "express";
import {
  addToPackageCartService,
  getPackageCartByUserIdService,
  removeFromPackageCartService,
} from "../services/packageCart.service.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";

export const addToPackageCartController = async (
  req: Request,
  res: Response,
) => {
  try {
    await addToPackageCartService(req.body);
    res.status(200).json({message: "Package added to cart"});
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to add package to cart.");
  }
};

export const getPackageCartByUserIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const {userId} = req.params as {userId: string};
    const cart = await getPackageCartByUserIdService(userId);
    res.status(200).json(cart);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch package cart.");
  }
};

export const removeFromPackageCartController = async (
  req: Request,
  res: Response,
) => {
  try {
    const {userId, packageId} = req.params as {
      userId: string;
      packageId: string;
    };
    await removeFromPackageCartService(userId, packageId);
    res.status(200).json({message: "Package removed from cart"});
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to remove package from cart.");
  }
};
