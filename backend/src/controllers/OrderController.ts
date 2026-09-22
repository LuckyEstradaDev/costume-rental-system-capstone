import type {Request, Response} from "express";
import {
  getAllOrdersService,
  getOrdersByUserIdService,
  orderService,
  packageOrderService,
} from "../services/order.service.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";
import type {IOrder} from "../interfaces/IOrder.js";
import type {IPackageCart} from "../interfaces/IPackageCart.js";
import type {IPayment} from "../interfaces/IPayment.js";

export const createOrderController = async (req: Request, res: Response) => {
  try {
    const orderData: IOrder = req.body.orderData;
    const paymentData: IPayment = req.body.paymentData;
    await orderService(orderData, paymentData);
    res.status(201).json({message: "Order created successfully"});
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to create order.");
  }
};

export const createPackageOrderController = async (
  req: Request,
  res: Response,
) => {
  try {
    const packageData: IPackageCart = req.body.packageCart;
    const paymentData: IPayment = req.body.paymentData;
    const order = await packageOrderService(packageData, paymentData);
    res.status(201).json({
      message: "Package order created successfully",
      data: order,
    });
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to create package order.");
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