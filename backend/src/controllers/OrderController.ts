import type {Request, Response} from "express";
import {
  getAllOrdersService,
  getOrdersByUserIdService,
  orderService,
} from "../services/order.service.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";
import type {IOrder} from "../interfaces/IOrder.js";

export const createOrderController = async (req: Request, res: Response) => {
  try {
    const orderData: IOrder = req.body;
    const {paymentID} = await orderService(orderData);
    res
      .status(201)
      .json({message: "Order created successfully", data: {paymentID}});
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

export const getAllOrdersController = async (req: Request, res: Response) => {
  try {
    const orders = await getAllOrdersService();
    res.status(200).json(orders);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch all orders.");
  }
};
