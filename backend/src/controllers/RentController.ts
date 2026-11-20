import type {Request, Response} from "express";
import type {ITokenRequest} from "../interfaces/ITokenReq.js";
import {
  checkOverdueRentalsService,
  createRentService,
  getAllRentsService,
  getRentsByUserID,
  packageRentService,
  updateRentByID,
} from "../services/rent.service.js";
import {
  getOrderOrRentByIdService,
  hasAdminAccessService,
} from "../services/user.service.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";
import {HTTPError} from "../utils/HttpError.js";
import type {IRent} from "../interfaces/IRent.js";
import type {IPayment} from "../interfaces/IPayment.js";
import type {IPackageCart} from "../interfaces/IPackageCart.js";
import type {IUserAddressInterface} from "../interfaces/IUser.js";

export const createRentController = async (req: Request, res: Response) => {
  try {
    const rentData: IRent = req.body.rentData;
    const paymentData: IPayment = req.body.paymentData;
    const rent = await createRentService(rentData, paymentData);
    return res.status(201).json({
      message: "Rent created successfully.",
      data: {
        orderID: rent._id.toString(),
        referenceID: rent.referenceID,
      },
    });
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

export const updateRentController = async (
  req: ITokenRequest,
  res: Response,
) => {
  try {
    const userId = req.user?._id;

    if (!userId || !(await hasAdminAccessService(String(userId)))) {
      throw new HTTPError("Admin access required.", 403);
    }

    const {id} = req.params as {id: string};
    const updateData: Partial<IRent> | undefined = req.body.updateData;

    if (
      !updateData?.securityDeposit ||
      Object.keys(updateData).length !== 1
    ) {
      throw new HTTPError("Only the security deposit can be updated.", 400);
    }

    const existingRecord = await getOrderOrRentByIdService(id);

    if (!existingRecord || existingRecord.type !== "rent") {
      throw new HTTPError("Rent not found.", 404);
    }

    const canEditExistingDeposit = Boolean(existingRecord.securityDeposit);
    const canSetNewDeposit = existingRecord.status === "ready";

    if (!canEditExistingDeposit && !canSetNewDeposit) {
      throw new HTTPError(
        "A deposit can only be set when a rent is ready for fitting, or edited once recorded.",
        409,
      );
    }

    const rent = await updateRentByID(id, {
      securityDeposit: updateData.securityDeposit,
    });
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
    const eventDate = req.body.eventDate ? new Date(req.body.eventDate) : undefined;
    const address: IUserAddressInterface | undefined = req.body.address;
    const notes = typeof req.body.notes === "string" ? req.body.notes : undefined;
    //call the service
    const rent = await packageRentService(
      packageData,
      paymentData,
      rentalDays,
      eventDate,
      address,
      notes,
    );

    res.status(201).json({
      message: "Package rent created successfully",
      data: {
        orderID: rent._id.toString(),
        referenceID: rent.referenceID,
      },
    });
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to create package rent.");
  }
};

export const checkOverdueRentalsController = async (
  req: ITokenRequest,
  res: Response,
) => {
  try {
    // Scope is derived from the token only: admin/staff check all rents,
    // regular users only their own.
    const hasAdminAccess = await hasAdminAccessService(String(req.user._id));
    const scope = hasAdminAccess ? {} : {userID: req.user._id};

    const result = await checkOverdueRentalsService(scope);

    return res.status(200).json({
      message: "Overdue check completed.",
      data: result,
    });
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to check overdue rents.");
  }
};
