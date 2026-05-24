import type {Request, Response} from "express";
import {
  getAllRentsAndOrdersService,
  getOrderOrRentByIdService,
  getRentsAndOrdersByUserIdService,
  markOrderOrRentPaymentPaidService,
  updateOrderOrRentStatusService,
} from "../services/user.service.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";

export const getAllRentsAndOrders = async (_req: Request, res: Response) => {
  try {
    const data = await getAllRentsAndOrdersService();
    return res.status(200).json({message: "Orders fetched successfully", data});
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch all orders and rents.");
  }
};

export const getRentsAndOrdersByUserId = async (
  req: Request,
  res: Response,
) => {
  const userId = req.params.id as string;
  try {
    const data = await getRentsAndOrdersByUserIdService(userId);
    res.status(200).json({message: "Data fetched successfully", data});
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to fetch user orders and rents.",
    );
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
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch order or rent.");
  }
};

export const updateOrderOrRentStatus = async (req: Request, res: Response) => {
  const orderId = req.params.id as string;
  const status = req.body.status as string | undefined;

  if (!status) {
    return res.status(400).json({message: "Status is required."});
  }

  try {
    const order = await updateOrderOrRentStatusService(orderId, status);

    if (!order) {
      return res.status(404).json({message: "Order not found."});
    }

    return res.status(200).json({
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to update order or rent status.",
    );
  }
};

export const markOrderOrRentPaymentPaid = async (
  req: Request,
  res: Response,
) => {
  const orderId = req.params.id as string;
  const cash = req.body.cash === undefined ? undefined : Number(req.body.cash);
  const cashAmount = cash;

  if (
    cashAmount !== undefined &&
    (!Number.isFinite(cashAmount) || cashAmount < 0)
  ) {
    return res.status(400).json({message: "Cash amount must be valid."});
  }

  try {
    const existingOrder = await getOrderOrRentByIdService(orderId);

    if (!existingOrder) {
      return res.status(404).json({message: "Order not found."});
    }

    if (
      existingOrder.payment?.method === "cash" &&
      (cashAmount === undefined || cashAmount < existingOrder.totalAmount)
    ) {
      return res.status(400).json({
        message: "Cash amount must be at least the order total.",
      });
    }

    const order = await markOrderOrRentPaymentPaidService(orderId, cashAmount);

    if (!order) {
      return res.status(404).json({message: "Order not found."});
    }

    return res.status(200).json({
      message: "Order payment marked as paid successfully",
      data: order,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to mark order or rent payment as paid.",
    );
  }
};
