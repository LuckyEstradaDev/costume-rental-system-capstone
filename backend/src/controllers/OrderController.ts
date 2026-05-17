import type {Request, Response} from "express";
import {
  getOrdersByUserIdService,
  orderService,
} from "../services/order.service.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";

export const createOrderController = async (req: Request, res: Response) => {
  try {
    await orderService(req.body);
    res.status(201).json({message: "Order created successfully"});
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to create order.");
  }
};

export const getOrdersByUserIdController = async (
  req: Request,
  res: Response,
) => {
  const {userId} = req.params as {userId: string};
  try {
    const orders = await getOrdersByUserIdService(userId);
    res.status(200).json(orders);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch user orders.");
  }
};
