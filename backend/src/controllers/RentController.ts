import type {Request, Response} from "express";
import type {ITokenRequest} from "../interfaces/ITokenReq.js";
import {
  createRentService,
  getAllRentsService,
  getRentsByUserID,
  packageRentService,
  updateRentByID,
} from "../services/rent.service.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";
import type {IRent} from "../interfaces/IRent.js";
import type {IPayment} from "../interfaces/IPayment.js";
import type {IPackageCart} from "../interfaces/IPackageCart.js";

export const createRentController = async (req: Request, res: Response) => {
  try {
    const rentData: IRent = req.body.rentData;
    const paymentData: IPayment = req.body.paymentData;
    const {paymentID} = await createRentService(rentData, paymentData);
    return res
      .status(201)
      .json({message: "Rent created successfully.", data: {paymentID}});
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

export const createPackageRentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const packageData: IPackageCart = req.body.packageData;
    const paymentData: IPayment = req.body.paymentData;
    const rentalDays = req.body.rentalDays;
    //call the service
    const rent = await packageRentService(packageData, paymentData, rentalDays);

    res.status(201).json({
      message: "Package rent created successfully",
      data: rent,
    });
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to create package rent.");
  }
};
