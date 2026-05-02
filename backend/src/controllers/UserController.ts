import type {Request, Response} from "express";
import {
  getOrderOrRentByIdService,
  getRentsAndOrdersByUserIdService,
} from "../services/user.service.js";

export const getRentsAndOrdersByUserId = async (
  req: Request,
  res: Response,
) => {
  const userId = req.params.id as string;
  try {
    const data = await getRentsAndOrdersByUserIdService(userId);
    res.status(200).json({message: "Data fetched successfully", data});
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "An error occurred while fetching data.",
    });
  }
};

export const getOrderOrRentById = async (req: Request, res: Response) => {
  const orderId = req.params.id as string;

  try {
    const order = await getOrderOrRentByIdService(orderId);

    if (!order) {
      return res.status(404).json({message: "Order not found."});
    }

    return res.status(200).json({
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "An error occurred while fetching the order.",
    });
  }
};
