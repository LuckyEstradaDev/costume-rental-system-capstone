import type {Request, Response} from "express";
import type {ITokenRequest} from "../interfaces/ITokenReq.js";
import {
  createRentService,
  getAllRentsService,
  getRentsByUserID,
  updateRentByID,
} from "../services/rent.service.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";
import type {IRent} from "../interfaces/IRent.js";

export const createRentController = async (req: Request, res: Response) => {
  try {
    const rentData: IRent = req.body;
    await createRentService(rentData);
    return res.status(201).json({message: "Rent created successfully."});
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to create rent.");
  }
};

export const getAllRentsController = async (req: Request, res: Response) => {
  try {
    const rents = await getAllRentsService();
    return res
      .status(200)
      .json({message: "Rents fetched successfully.", rents});
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch rents.");
  }
};

export const getRentsByUserController = async (
  req: ITokenRequest,
  res: Response,
) => {
  try {
    const userId = req.user._id;
    const rents = await getRentsByUserID(userId);
    return res
      .status(200)
      .json({message: "User rents fetched successfully.", rents});
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch user rents.");
  }
};

export const updateRentController = async (req: Request, res: Response) => {
  try {
    const {id} = req.params as {id: string};
    const updateData: Partial<IRent> = req.body.updateData;
    const rent = await updateRentByID(id, updateData);
    return res.status(200).json({message: "Rent updated successfully.", rent});
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to update rent.");
  }
};
