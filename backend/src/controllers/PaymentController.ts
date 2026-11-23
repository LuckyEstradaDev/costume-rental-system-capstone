import type {Response} from "express";
import {
  createPaymentService,
  getAllPaymentsService,
  markOrderOrRentPaymentRefundedService,
  updatePaymentService,
} from "../services/payment.service.js";
import {hasAdminAccessService} from "../services/user.service.js";
import type {ITokenRequest} from "../interfaces/ITokenReq.js";
import {HTTPError} from "../utils/HttpError.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";

const assertAdminAccess = async (req: ITokenRequest) => {
  const userId = req.user?._id;

  if (!userId || !(await hasAdminAccessService(String(userId)))) {
    throw new HTTPError("Admin access required.", 403);
  }
};

export const createPaymentController = async (req: ITokenRequest, res: Response) => {
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

export const updatePaymentController = async (
  req: ITokenRequest,
  res: Response,
) => {
  try {
    await assertAdminAccess(req);
    const payment = await updatePaymentService(req.body);
    return res.status(200).json({
      message: "Payment updated successfully",
      data: payment,
    });
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to update payment.");
  }
};

export const getAllPaymentsController = async (
  req: ITokenRequest,
  res: Response,
) => {
  try {
    await assertAdminAccess(req);
    const payments = await getAllPaymentsService();
    return res.status(200).json({
      message: "Payments retrieved successfully",
      data: payments,
    });
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to retrieve payments.");
  }
};

export const markPaymentRefundedController = async (
  req: ITokenRequest,
  res: Response,
) => {
  try {
    await assertAdminAccess(req);
    const {id} = req.body ?? {};
    if (typeof id !== "string" || !id.trim()) {
      throw new HTTPError("Order ID is required.", 400);
    }
    await markOrderOrRentPaymentRefundedService(id);
    return res.status(200).json({
      message: "Payment refunded successfully",
    });
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to refund payment");
  }
};
