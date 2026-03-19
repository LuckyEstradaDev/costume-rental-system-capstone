import type {Request, Response} from "express";
import type {ITokenRequest} from "../interfaces/ITokenReq.js";
import type {INewRent} from "../interfaces/IRent.js";
import {
  createRentService,
  getAllRentsService,
  getRentsByUserID,
  updateRentByID,
} from "../services/rent.service.js";

export const createRentController = async (req: Request, res: Response) => {
  try {
    const rentData: INewRent = req.body;
    await createRentService(rentData);
    return res.status(201).json({message: "Rent created successfully."});
  } catch (error: any) {
    return res.status(500).json({message: error.message});
  }
};

export const getAllRentsController = async (req: Request, res: Response) => {
  try {
    const rents = await getAllRentsService();
    return res
      .status(200)
      .json({message: "Rents fetched successfully.", rents});
  } catch (error: any) {
    return res.status(500).json({message: error.message});
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
  } catch (error: any) {
    return res.status(500).json({message: error.message});
  }
};

export const updateRentController = async (req: Request, res: Response) => {
  try {
    const {id} = req.params as {id: string};
    const updateData: Partial<INewRent> = req.body.updateData;
    const rent = await updateRentByID(id, updateData);
    return res.status(200).json({message: "Rent updated successfully.", rent});
  } catch (error: any) {
    return res.status(500).json({message: error.message});
  }
};
