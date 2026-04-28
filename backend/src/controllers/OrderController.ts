import type {Request, Response} from "express";
import {orderService} from "../services/order.service.js";

export const createOrderController = async (req: Request, res: Response) => {
  try {
    await orderService(req.body);
    res.status(201).json({message: "Order created successfully"});
  } catch (error) {
    res.status(500).json({message: "Error creating order"});
  }
};
