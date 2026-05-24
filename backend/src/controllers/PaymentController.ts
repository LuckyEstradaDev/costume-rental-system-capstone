import type {Request, Response} from "express";
import {
  createPaymentService,
  updatePaymentService,
} from "../services/payment.service.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";

export const createPaymentController = async (req: Request, res: Response) => {
  try {
    const payment = await createPaymentService(req.body);
    return res.status(201).json({
      message: "Payment created successfully",
      data: payment,
    });
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to create payment.");
  }
};

export const updatePaymentController = async (req: Request, res: Response) => {
  try {
    const payment = await updatePaymentService(req.body);
    return res.status(200).json({
      message: "Payment updated successfully",
      data: payment,
    });
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to update payment.");
  }
};
